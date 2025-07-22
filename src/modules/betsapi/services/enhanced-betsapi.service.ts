// src/modules/betsapi/services/enhanced-betsapi.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { BetsApiService } from './betsapi.service';
import { FootballMatchesService } from '../../football-matches/services/football-matches.service';
import { MatchType } from '../types/betsapi.types';
import { EnhancedMatchResponse } from '../../football-matches/types/football-match.types';

// 🔧 인터페이스들을 export로 변경
export interface SelectiveSyncOptions {
  forceOverwrite?: boolean;
  statsOnly?: boolean;
  dateFilter?: string;
  matchType?: string;
}

export interface SelectiveSyncResult {
  updated: number;
  created: number;
  errors: number;
  skipped: number;
  details: Array<{
    eventId: string;
    status: 'updated' | 'created' | 'error' | 'skipped';
    message?: string;
  }>;
}

// 🆕 스마트 동기화 결과 인터페이스
export interface SmartSyncResult {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  details: string[];
}

@Injectable()
export class EnhancedBetsApiService {
  private readonly logger = new Logger(EnhancedBetsApiService.name);

  constructor(
    private readonly betsApiService: BetsApiService,
    private readonly footballMatchesService: FootballMatchesService,
  ) {}

  // 🔧 수정: 스마트 자동 동기화 - JSON 파싱 오류 방지
  async smartAutoSync(type: MatchType, day?: string): Promise<SmartSyncResult> {
    this.logger.log(`🔄 스마트 동기화 시작 - 타입: ${type}, 날짜: ${day || '오늘'}`);
    
    const result: SmartSyncResult = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      details: []
    };

    try {
      // 1. BetsAPI에서 데이터 가져오기 - 안전한 호출
      let betsApiResponse;
      
      try {
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
        
        // 🔧 응답 검증 강화
        if (!this.isValidBetsApiResponse(betsApiResponse)) {
          this.logger.warn(`⚠️ BetsAPI 응답이 유효하지 않음 - 타입: ${type}`);
          result.details.push('BetsAPI 응답이 null이거나 유효하지 않음');
          return result;
        }

      } catch (apiError) {
        this.logger.error(`❌ BetsAPI 호출 실패 (${type}):`, apiError.message);
        result.errors++;
        result.details.push(`BetsAPI 호출 실패: ${apiError.message}`);
        return result;
      }

      // 🔧 결과 검증
      if (!betsApiResponse.results || betsApiResponse.results.length === 0) {
        this.logger.log(`📭 BetsAPI에서 ${type} 경기 없음 - 동기화할 데이터 없음`);
        result.details.push(`${type} 타입의 경기 데이터 없음`);
        return result;
      }

      // 2. 페이징이 있는 경우 모든 페이지 가져오기 (안전하게)
      let allMatches = [...betsApiResponse.results];
      
      if (this.hasPagination(betsApiResponse)) {
        try {
          const additionalMatches = await this.fetchAdditionalPages(type, betsApiResponse, day);
          allMatches.push(...additionalMatches);
        } catch (paginationError) {
          this.logger.warn(`⚠️ 추가 페이지 가져오기 실패:`, paginationError.message);
          // 첫 페이지 데이터는 유지하고 계속 진행
        }
      }

      this.logger.log(`📊 BetsAPI에서 ${allMatches.length}개 경기 가져옴`);

      // 3. 각 경기에 대해 스마트 동기화 수행
      for (const betsMatch of allMatches) {
        try {
          // 🔧 경기 데이터 검증
          if (!this.isValidMatchData(betsMatch)) {
            this.logger.warn(`⚠️ 유효하지 않은 경기 데이터 건너뜀: ${betsMatch?.id}`);
            result.skipped++;
            continue;
          }

          // 기존 경기 확인
          const existingMatch = await this.footballMatchesService.getByBetsApiId(betsMatch.id);
          
          if (existingMatch) {
            // 🔧 동기화 허용 여부 확인 (allowSync가 false면 건너뜀)
            if (existingMatch.allowSync === false) {
              result.skipped++;
              result.details.push(`${betsMatch.home?.name || '팀1'} vs ${betsMatch.away?.name || '팀2'} - 동기화 차단됨`);
              this.logger.debug(`🚫 동기화 차단: ${betsMatch.id} (${betsMatch.home?.name} vs ${betsMatch.away?.name})`);
              continue;
            }

            // 동기화 허용된 경기는 업데이트
            const updateData = this.mapBetsApiToUpdateData(betsMatch);
            await this.footballMatchesService.update(existingMatch._id.toString(), updateData);
            result.updated++;
            result.details.push(`✏️ ${betsMatch.home?.name || '팀1'} vs ${betsMatch.away?.name || '팀2'} - 업데이트 완료`);
            this.logger.debug(`✏️ 경기 업데이트: ${betsMatch.home?.name} vs ${betsMatch.away?.name}`);
          } else {
            // 새 경기 생성
            const createData = this.mapBetsApiToCreateData(betsMatch);
            await this.footballMatchesService.create(createData);
            result.created++;
            result.details.push(`🆕 ${betsMatch.home?.name || '팀1'} vs ${betsMatch.away?.name || '팀2'} - 생성 완료`);
            this.logger.debug(`🆕 경기 생성: ${betsMatch.home?.name} vs ${betsMatch.away?.name}`);
          }
        } catch (matchError) {
          result.errors++;
          const errorMsg = `경기 동기화 실패 (ID: ${betsMatch?.id}): ${matchError.message}`;
          result.details.push(errorMsg);
          this.logger.error(`❌ ${errorMsg}`);
        }
      }

      this.logger.log(`✅ 스마트 동기화 완료 - 생성: ${result.created}, 업데이트: ${result.updated}, 건너뜀: ${result.skipped}, 오류: ${result.errors}`);
      return result;

    } catch (error) {
      this.logger.error(`❌ 스마트 동기화 전체 실패:`, error);
      result.errors++;
      result.details.push(`전체 동기화 실패: ${error.message}`);
      throw error;
    }
  }

  // 🔧 새로운 검증 메서드들
  private isValidBetsApiResponse(response: any): boolean {
    if (!response) {
      this.logger.warn('BetsAPI 응답이 null 또는 undefined');
      return false;
    }
    
    if (typeof response !== 'object') {
      this.logger.warn('BetsAPI 응답이 객체가 아님');
      return false;
    }

    // results가 배열이 아니어도 일단 유효하다고 판단 (빈 결과일 수 있음)
    return true;
  }

  private isValidMatchData(match: any): boolean {
    if (!match || typeof match !== 'object') {
      return false;
    }

    // 최소한 id와 home/away 정보가 있어야 함
    return match.id && (match.home || match.away);
  }

  private hasPagination(response: any): boolean {
    return response?.pager && 
           typeof response.pager === 'object' && 
           response.pager.total > response.pager.per_page;
  }

  // 🔧 추가 페이지 가져오기 - 안전한 구현
  private async fetchAdditionalPages(type: MatchType, initialResponse: any, day?: string): Promise<any[]> {
    const additionalMatches: any[] = [];
    
    if (!this.hasPagination(initialResponse)) {
      return additionalMatches;
    }

    const totalPages = Math.ceil(initialResponse.pager.total / initialResponse.pager.per_page);
    const maxPages = Math.min(totalPages, 5); // 최대 5페이지까지만

    for (let page = 2; page <= maxPages; page++) {
      try {
        let pageResponse;
        
        switch (type) {
          case 'upcoming':
            pageResponse = await this.betsApiService.getUpcomingMatches(page, day);
            break;
          case 'ended':
            pageResponse = await this.betsApiService.getEndedMatches(page, day);
            break;
          default:
            continue; // inplay는 페이징하지 않음
        }
        
        if (this.isValidBetsApiResponse(pageResponse) && pageResponse.results) {
          additionalMatches.push(...pageResponse.results);
        }
      } catch (pageError) {
        this.logger.warn(`⚠️ 페이지 ${page} 가져오기 실패:`, pageError.message);
        // 한 페이지 실패해도 계속 진행
        continue;
      }
    }

    return additionalMatches;
  }

  // 🆕 스마트 전체 동기화 (오늘 + 내일) - 수정된 버전
async smartFullSync(): Promise<{
  upcoming: SmartSyncResult;
  ended: SmartSyncResult;
  total: SmartSyncResult;
}> {
  try {
    this.logger.log('🌐 전체 스마트 동기화 시작');

    const today = this.formatDateForAPI(new Date());
    const tomorrow = this.formatDateForAPI(new Date(Date.now() + 24 * 60 * 60 * 1000));

    const [upcomingTodaySync, endedSync, upcomingTomorrowSync] = await Promise.all([
      this.smartAutoSync('upcoming', today),
      this.smartAutoSync('ended', today),
      this.smartAutoSync('upcoming', tomorrow),
    ]);

    const upcoming: SmartSyncResult = {
      created: upcomingTodaySync.created + upcomingTomorrowSync.created,
      updated: upcomingTodaySync.updated + upcomingTomorrowSync.updated,
      skipped: upcomingTodaySync.skipped + upcomingTomorrowSync.skipped,
      errors: upcomingTodaySync.errors + upcomingTomorrowSync.errors,
      details: [
        ...upcomingTodaySync.details,
        ...upcomingTomorrowSync.details
      ]
    };

    const total: SmartSyncResult = {
      created: upcoming.created + endedSync.created,
      updated: upcoming.updated + endedSync.updated,
      skipped: upcoming.skipped + endedSync.skipped,
      errors: upcoming.errors + endedSync.errors,
      details: [
        ...upcoming.details,
        ...endedSync.details
      ]
    };

    this.logger.log(`✅ 전체 스마트 동기화 완료 - 총 생성: ${total.created}, 총 업데이트: ${total.updated}, 총 건너뜀: ${total.skipped}`);

    return {
      upcoming,
      ended: endedSync,
      total,
    };

  } catch (error) {
    this.logger.error('❌ 전체 스마트 동기화 실패:', error);
    throw error;
  }
}

  // BetsAPI 데이터를 업데이트용 데이터로 매핑
  private mapBetsApiToUpdateData(betsMatch: any): any {
    return {
      time: betsMatch.time,
      time_status: betsMatch.time_status,
      league: betsMatch.league,
      home: betsMatch.home,
      away: betsMatch.away,
      o_home: betsMatch.o_home,
      o_away: betsMatch.o_away,
      ss: betsMatch.ss,
      scores: betsMatch.scores,
      timer: betsMatch.timer,
      stats: betsMatch.stats,
      bet365_id: betsMatch.bet365_id,
      round: betsMatch.round,
      lastSyncAt: new Date(),
      dataSource: 'betsapi_smart_sync',
    };
  }

  // BetsAPI 데이터를 생성용 데이터로 매핑
  private mapBetsApiToCreateData(betsMatch: any): any {
    return {
      betsApiId: betsMatch.id,
      sport_id: betsMatch.sport_id || '1',
      time: betsMatch.time,
      time_status: betsMatch.time_status,
      league: betsMatch.league,
      home: betsMatch.home,
      away: betsMatch.away,
      o_home: betsMatch.o_home,
      o_away: betsMatch.o_away,
      ss: betsMatch.ss,
      scores: betsMatch.scores,
      timer: betsMatch.timer,
      stats: betsMatch.stats,
      bet365_id: betsMatch.bet365_id,
      round: betsMatch.round,
      status: 'active',
      allowSync: true, // 새로 생성되는 경기는 기본적으로 동기화 허용
      dataSource: 'betsapi_smart_sync',
      lastSyncAt: new Date(),
    };
  }

  // 🆕 선택적 동기화 메서드 (기존 유지)
  async selectiveSync(eventIds: string[], options: SelectiveSyncOptions = {}): Promise<SelectiveSyncResult> {
    this.logger.log(`🎯 선택적 동기화 시작 - ${eventIds.length}개 경기`);
    this.logger.log(`📋 옵션: ${JSON.stringify(options)}`);

    const result: SelectiveSyncResult = {
      updated: 0,
      created: 0,
      errors: 0,
      skipped: 0,
      details: []
    };

    for (const eventId of eventIds) {
      try {
        this.logger.debug(`🔄 경기 처리 중: ${eventId}`);
        
        // 1. BetsAPI에서 경기 상세 정보 가져오기
        const betsApiMatch = await this.fetchMatchFromBetsApi(eventId);
        if (!betsApiMatch) {
          result.skipped++;
          result.details.push({
            eventId,
            status: 'skipped',
            message: 'BetsAPI에서 경기를 찾을 수 없음'
          });
          continue;
        }

        // 2. 로컬 DB에서 기존 경기 확인
        const existingMatch = await this.footballMatchesService.getByBetsApiId(eventId);
        
        // 3. 동기화 옵션에 따른 처리
        if (existingMatch) {
          // 기존 경기 업데이트
          if (options.forceOverwrite || this.shouldUpdate(existingMatch, betsApiMatch, options)) {
            await this.updateExistingMatch(existingMatch, betsApiMatch, options);
            result.updated++;
            result.details.push({
              eventId,
              status: 'updated',
              message: '기존 경기 업데이트 완료'
            });
            this.logger.debug(`✅ 경기 업데이트: ${eventId}`);
          } else {
            result.skipped++;
            result.details.push({
              eventId,
              status: 'skipped',
              message: '업데이트 조건에 맞지 않음'
            });
          }
        } else {
          // 새 경기 생성
          await this.createNewMatch(betsApiMatch);
          result.created++;
          result.details.push({
            eventId,
            status: 'created',
            message: '새 경기 생성 완료'
          });
          this.logger.debug(`🆕 경기 생성: ${eventId}`);
        }

      } catch (error) {
        result.errors++;
        result.details.push({
          eventId,
          status: 'error',
          message: error.message
        });
        this.logger.error(`❌ 경기 동기화 실패 (${eventId}):`, error.message);
      }
    }

    this.logger.log(`✅ 선택적 동기화 완료 - 업데이트: ${result.updated}, 생성: ${result.created}, 오류: ${result.errors}, 건너뜀: ${result.skipped}`);
    return result;
  }

  // 🆕 BetsAPI에서 경기 정보 가져오기
  private async fetchMatchFromBetsApi(eventId: string): Promise<any | null> {
    try {
      // BetsAPI에서 경기 상세 정보 가져오기
      const matchDetails = await this.betsApiService.getMatchDetails(eventId);
      return matchDetails?.results?.[0] || null;
    } catch (error) {
      this.logger.warn(`⚠️ BetsAPI에서 경기 조회 실패 (${eventId}):`, error.message);
      return null;
    }
  }

  // 🆕 업데이트 여부 판단
  private shouldUpdate(existingMatch: any, betsApiMatch: any, options: SelectiveSyncOptions): boolean {
    // 강제 덮어쓰기가 활성화된 경우
    if (options.forceOverwrite) {
      return true;
    }

    // 통계만 업데이트하는 경우
    if (options.statsOnly) {
      return !existingMatch.stats || Object.keys(existingMatch.stats || {}).length === 0;
    }

    // 기본적으로 경기 상태나 스코어가 변경된 경우 업데이트
    return (
      existingMatch.time_status !== betsApiMatch.time_status ||
      existingMatch.ss !== betsApiMatch.ss ||
      !existingMatch.stats
    );
  }

  // 🆕 기존 경기 업데이트
  private async updateExistingMatch(existingMatch: any, betsApiMatch: any, options: SelectiveSyncOptions): Promise<void> {
    const updateData: any = {};

    if (options.statsOnly) {
      // 통계 데이터만 업데이트
      if (betsApiMatch.stats) {
        updateData.stats = betsApiMatch.stats;
      }
      if (betsApiMatch.timer) {
        updateData.timer = betsApiMatch.timer;
      }
    } else {
      // 전체 데이터 업데이트
      updateData.time_status = betsApiMatch.time_status;
      updateData.ss = betsApiMatch.ss;
      updateData.scores = betsApiMatch.scores;
      updateData.timer = betsApiMatch.timer;
      updateData.stats = betsApiMatch.stats;
      
      // 팀 정보 업데이트 (필요한 경우)
      if (betsApiMatch.home) updateData.home = betsApiMatch.home;
      if (betsApiMatch.away) updateData.away = betsApiMatch.away;
      if (betsApiMatch.o_home) updateData.o_home = betsApiMatch.o_home;
      if (betsApiMatch.o_away) updateData.o_away = betsApiMatch.o_away;
    }

    updateData.lastSyncAt = new Date();
    updateData.dataSource = 'betsapi_selective_sync';

    await this.footballMatchesService.update(existingMatch._id.toString(), updateData);
  }

  // 🆕 새 경기 생성
  private async createNewMatch(betsApiMatch: any): Promise<void> {
    const createData = {
      betsApiId: betsApiMatch.id,
      sport_id: betsApiMatch.sport_id || '1',
      time: betsApiMatch.time,
      time_status: betsApiMatch.time_status,
      league: betsApiMatch.league,
      home: betsApiMatch.home,
      away: betsApiMatch.away,
      o_home: betsApiMatch.o_home,
      o_away: betsApiMatch.o_away,
      ss: betsApiMatch.ss,
      scores: betsApiMatch.scores,
      timer: betsApiMatch.timer,
      stats: betsApiMatch.stats,
      bet365_id: betsApiMatch.bet365_id,
      round: betsApiMatch.round,
      status: 'active',
      dataSource: 'betsapi_selective_sync',
      lastSyncAt: new Date(),
    };

    await this.footballMatchesService.create(createData);
  }

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
          allowSync: match.allowSync !== false, // 동기화 허용 상태 포함
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
   * BetsAPI에서 데이터를 가져와 DB에 저장 (자동 동기화) - 기존 메서드 (deprecated)
   */
  async autoSyncMatches(type: MatchType, day?: string): Promise<{ created: number; updated: number }> {
    // smartAutoSync로 대체되었으므로 이 메서드 호출 시 smartAutoSync 사용
    const result = await this.smartAutoSync(type, day);
    return {
      created: result.created,
      updated: result.updated,
    };
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
          allowSync: localMatch.allowSync !== false, // 동기화 허용 상태 포함
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
   * 전체 동기화 (오늘, 내일 데이터) - 기존 메서드 (deprecated)
   */
  async fullSync(): Promise<{
    upcoming: { created: number; updated: number };
    ended: { created: number; updated: number };
    total: { created: number; updated: number };
  }> {
    // smartFullSync로 대체
    const result = await this.smartFullSync();
    return {
      upcoming: {
        created: result.upcoming.created,
        updated: result.upcoming.updated,
      },
      ended: {
        created: result.ended.created,
        updated: result.ended.updated,
      },
      total: {
        created: result.total.created,
        updated: result.total.updated,
      },
    };
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
      o_home: dbMatch.o_home,
      o_away: dbMatch.o_away,
      ss: dbMatch.ss,
      scores: dbMatch.scores,
      timer: dbMatch.timer,
      stats: dbMatch.stats,
      bet365_id: dbMatch.bet365_id,
      round: dbMatch.round,
      _id: dbMatch._id.toString(),
      adminNote: dbMatch.adminNote,
      allowSync: dbMatch.allowSync, // 동기화 허용 상태 포함
    };
  }
}