// src/modules/betsapi/services/enhanced-betsapi.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { BetsApiService } from './betsapi.service';
import { FootballMatchesService } from '../../football-matches/services/football-matches.service';
import { MatchType } from '../types/betsapi.types';
import { EnhancedMatchResponse } from '../../football-matches/types/football-match.types';

@Injectable()
export class EnhancedBetsApiService {
  private readonly logger = new Logger(EnhancedBetsApiService.name);

  constructor(
    private readonly betsApiService: BetsApiService,
    private readonly footballMatchesService: FootballMatchesService,
  ) {}

  /**
   * DB에 저장된 데이터만 반환 (DB 우선 방식)
   */
  async getEnhancedMatches(
    type: MatchType,
    page: number = 1,
    day?: string,
    leagueId?: string
  ): Promise<EnhancedMatchResponse> {
    try {
      this.logger.log(`DB에서 ${type} 경기 조회 - page: ${page}, day: ${day}, league: ${leagueId}`);

      // DB에서만 데이터 조회
      const timeStatus = this.getTimeStatusByType(type);
      let dbMatches;

      if (day) {
        // 특정 날짜 필터링
        const startTimestamp = this.dayToTimestampRange(day).start;
        const endTimestamp = this.dayToTimestampRange(day).end;
        dbMatches = await this.footballMatchesService.getByDateRange(startTimestamp, endTimestamp);
      } else {
        // 상태별 조회
        const limit = type === 'inplay' ? undefined : 20; // inplay는 제한 없음, 나머지는 페이징
        dbMatches = await this.footballMatchesService.getByTimeStatus(timeStatus, limit);
      }

      // 페이징 처리 (간단한 페이징)
      const startIndex = (page - 1) * 20;
      const endIndex = startIndex + 20;
      const paginatedMatches = type === 'inplay' ? dbMatches : dbMatches.slice(startIndex, endIndex);

      // DB 데이터를 BetsAPI 형식으로 변환
      const formattedMatches = paginatedMatches.map(match => this.formatDbMatchToBetsApi(match));

      return {
        results: formattedMatches.map(match => ({
          ...match,
          isModified: true, // DB에 저장된 데이터는 모두 관리 대상
          localData: match,
        })),
        pager: type === 'inplay' ? undefined : {
          page,
          per_page: 20,
          total: dbMatches.length,
        },
        enhanced: true,
        stats: {
          total_matches: paginatedMatches.length,
          modified_matches: paginatedMatches.length, // 모두 DB 데이터
          local_only_matches: 0,
        }
      };

    } catch (error) {
      this.logger.error(`DB에서 ${type} 경기 조회 실패:`, error);
      throw error;
    }
  }

  /**
   * BetsAPI에서 데이터를 가져와 DB에 저장 (자동 동기화)
   */
  async autoSyncMatches(type: MatchType, day?: string): Promise<{ created: number; updated: number }> {
    try {
      this.logger.log(`BetsAPI에서 ${type} 경기 동기화 시작 - day: ${day}`);

      let betsApiResponse;
      
      switch (type) {
        case 'upcoming':
          betsApiResponse = await this.betsApiService.getUpcomingMatches(1, day);
          break;
        case 'inplay':
          betsApiResponse = await this.betsApiService.getInplayMatches();
          break;
        case 'ended':
          betsApiResponse = await this.betsApiService.getEndedMatches(1, day);
          break;
      }

      if (!betsApiResponse || !betsApiResponse.results || betsApiResponse.results.length === 0) {
        this.logger.log(`BetsAPI에서 ${type} 경기 없음 - 동기화할 데이터 없음`);
        return { created: 0, updated: 0 };
      }

      // 페이징이 있는 경우 모든 페이지 가져오기
      let allMatches = [...betsApiResponse.results];
      
      if (betsApiResponse.pager && betsApiResponse.pager.total > betsApiResponse.pager.per_page) {
        const totalPages = Math.ceil(betsApiResponse.pager.total / betsApiResponse.pager.per_page);
        
        for (let page = 2; page <= Math.min(totalPages, 5); page++) { // 최대 5페이지까지만
          let pageResponse;
          
          switch (type) {
            case 'upcoming':
              pageResponse = await this.betsApiService.getUpcomingMatches(page, day);
              break;
            case 'ended':
              pageResponse = await this.betsApiService.getEndedMatches(page, day);
              break;
          }
          
          if (pageResponse?.results) {
            allMatches.push(...pageResponse.results);
          }
        }
      }

      // DB에 저장
      const syncResult = await this.footballMatchesService.syncFromBetsApi(allMatches);
      
      this.logger.log(`${type} 경기 동기화 완료 - 생성: ${syncResult.created}, 업데이트: ${syncResult.updated}`);
      
      return syncResult;

    } catch (error) {
      this.logger.error(`${type} 경기 동기화 실패:`, error);
      throw error;
    }
  }

  /**
   * 특정 경기의 상세 정보 (DB 우선)
   */
  async getEnhancedMatchDetails(eventId: string) {
    try {
      this.logger.log(`DB에서 경기 상세 조회 - eventId: ${eventId}`);

      // DB에서 먼저 확인
      const localMatch = await this.footballMatchesService.getByBetsApiId(eventId);

      if (localMatch) {
        // DB에 있는 경우 DB 데이터 반환
        return {
          ...this.formatDbMatchToBetsApi(localMatch),
          _id: localMatch._id.toString(),
          adminNote: localMatch.adminNote,
          isModified: true,
          localData: localMatch.toObject(),
          lastModified: localMatch.updatedAt,
        };
      }

      // DB에 없는 경우 빈 결과 반환 (BetsAPI 호출하지 않음)
      return {
        error: 'DB에 저장되지 않은 경기입니다. 자동 동기화를 먼저 실행해주세요.',
        isModified: false,
      };

    } catch (error) {
      this.logger.error(`경기 상세 조회 실패 - eventId: ${eventId}`, error);
      throw error;
    }
  }

  /**
   * 전체 동기화 (오늘, 내일 데이터)
   */
  async fullSync(): Promise<{
    upcoming: { created: number; updated: number };
    ended: { created: number; updated: number };
    total: { created: number; updated: number };
  }> {
    try {
      this.logger.log('전체 동기화 시작');

      const today = this.formatDateForAPI(new Date());
      const tomorrow = this.formatDateForAPI(new Date(Date.now() + 24 * 60 * 60 * 1000));

      const [upcomingSync, endedSync] = await Promise.all([
        this.autoSyncMatches('upcoming', today),
        this.autoSyncMatches('ended', today),
      ]);

      // 내일 예정 경기도 동기화
      const tomorrowUpcoming = await this.autoSyncMatches('upcoming', tomorrow);

      const total = {
        created: upcomingSync.created + endedSync.created + tomorrowUpcoming.created,
        updated: upcomingSync.updated + endedSync.updated + tomorrowUpcoming.updated,
      };

      this.logger.log(`전체 동기화 완료 - 총 생성: ${total.created}, 총 업데이트: ${total.updated}`);

      return {
        upcoming: {
          created: upcomingSync.created + tomorrowUpcoming.created,
          updated: upcomingSync.updated + tomorrowUpcoming.updated,
        },
        ended: endedSync,
        total,
      };

    } catch (error) {
      this.logger.error('전체 동기화 실패:', error);
      throw error;
    }
  }

  /**
   * DB 저장된 경기 수 조회
   */
  async getDbMatchesCount(): Promise<{
    upcoming: number;
    inplay: number;
    ended: number;
    total: number;
  }> {
    try {
      const [upcoming, inplay, ended] = await Promise.all([
        this.footballMatchesService.getByTimeStatus('0'),
        this.footballMatchesService.getByTimeStatus('1'),
        this.footballMatchesService.getByTimeStatus('3'),
      ]);

      return {
        upcoming: upcoming.length,
        inplay: inplay.length,
        ended: ended.length,
        total: upcoming.length + inplay.length + ended.length,
      };
    } catch (error) {
      this.logger.error('DB 경기 수 조회 실패:', error);
      return { upcoming: 0, inplay: 0, ended: 0, total: 0 };
    }
  }

  // === Private Helper Methods ===

  private getTimeStatusByType(type: MatchType): string {
    switch (type) {
      case 'upcoming': return '0';
      case 'inplay': return '1'; 
      case 'ended': return '3';
      default: return '0';
    }
  }

  private formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  private dayToTimestampRange(day: string): { start: string; end: string } {
    // YYYYMMDD -> timestamp 범위
    const year = parseInt(day.substring(0, 4));
    const month = parseInt(day.substring(4, 6)) - 1; // JS month는 0-based
    const dayNum = parseInt(day.substring(6, 8));
    
    const startDate = new Date(year, month, dayNum, 0, 0, 0);
    const endDate = new Date(year, month, dayNum, 23, 59, 59);
    
    return {
      start: Math.floor(startDate.getTime() / 1000).toString(),
      end: Math.floor(endDate.getTime() / 1000).toString(),
    };
  }

  private formatDbMatchToBetsApi(dbMatch: any) {
    return {
      id: dbMatch.betsApiId,
      sport_id: dbMatch.sport_id,
      time: dbMatch.time,
      time_status: dbMatch.time_status,
      league: dbMatch.league,
      home: dbMatch.home,
      away: dbMatch.away,
      ss: dbMatch.ss,
      scores: dbMatch.scores,
      timer: dbMatch.timer,
      bet365_id: dbMatch.bet365_id,
      round: dbMatch.round,
      _id: dbMatch._id.toString(),
      adminNote: dbMatch.adminNote,
    };
  }
}