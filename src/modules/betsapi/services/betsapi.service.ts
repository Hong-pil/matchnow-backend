// src/modules/betsapi/services/betsapi.service.ts
import { Injectable, Logger } from '@nestjs/common';
import {
  BetsApiUpcomingResponse,
  BetsApiInplayResponse,
  BetsApiEndedResponse,
  BetsApiLeaguesResponse,
  BetsApiFixture,
  MatchType,
  MatchTimeStatus,
} from '../types/betsapi.types';

// 날짜별 경기 데이터 인터페이스
interface DayMatches {
  date: string;
  matches: any[];
  total: number;
}

// 날짜 범위 경기 조회 결과 인터페이스
interface DateRangeMatchesResponse {
  results: DayMatches[];
  summary: {
    total_days: number;
    total_matches: number;
    date_range: { start: string; end: string };
  };
}

@Injectable()
export class BetsApiService {
  private readonly logger = new Logger(BetsApiService.name);
  private readonly baseUrl = 'https://api.b365api.com';
  private readonly token = '224394-KF2Q7zYNxcNdiH';

  /**
   * 예정된 축구 경기 목록 조회 (v3 API)
   */
  async getUpcomingMatches(page: number = 1, day?: string): Promise<BetsApiUpcomingResponse> {
    try {
      let url = `${this.baseUrl}/v3/events/upcoming?sport_id=1&token=${this.token}&page=${page}`;
      
      // day 파라미터가 있으면 추가 (YYYYMMDD 형식)
      if (day) {
        url += `&day=${day}`;
      }
      
      this.logger.log(`Fetching upcoming matches from: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: BetsApiUpcomingResponse = await response.json();
      
      this.logger.log(`Fetched ${data.results?.length || 0} upcoming matches (Total: ${data.pager?.total || 0})`);
      
      return data;
    } catch (error) {
      this.logger.error('Error fetching upcoming matches:', error);
      throw new Error(`Failed to fetch upcoming matches: ${error.message}`);
    }
  }

  /**
   * 진행 중인 축구 경기 목록 조회 (v3 API)
   */
  async getInplayMatches(): Promise<BetsApiInplayResponse> {
    try {
      const url = `${this.baseUrl}/v3/events/inplay?sport_id=1&token=${this.token}`;
      
      this.logger.log(`Fetching inplay matches from: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: BetsApiInplayResponse = await response.json();
      
      this.logger.log(`Fetched ${data.results?.length || 0} inplay matches`);
      
      return data;
    } catch (error) {
      this.logger.error('Error fetching inplay matches:', error);
      throw new Error(`Failed to fetch inplay matches: ${error.message}`);
    }
  }

  /**
   * 종료된 축구 경기 목록 조회 (v3 API)
   */
  async getEndedMatches(page: number = 1, day?: string): Promise<BetsApiEndedResponse> {
    try {
      let url = `${this.baseUrl}/v3/events/ended?sport_id=1&token=${this.token}&page=${page}`;
      
      // day 파라미터가 있으면 추가 (YYYYMMDD 형식)
      if (day) {
        url += `&day=${day}`;
      }
      
      this.logger.log(`Fetching ended matches from: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: BetsApiEndedResponse = await response.json();
      
      this.logger.log(`Fetched ${data.results?.length || 0} ended matches (Total: ${data.pager?.total || 0})`);
      
      return data;
    } catch (error) {
      this.logger.error('Error fetching ended matches:', error);
      throw new Error(`Failed to fetch ended matches: ${error.message}`);
    }
  }

  /**
   * 특정 경기 상세 정보 조회 (v1 API)
   */
  async getMatchDetails(eventId: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/v1/event/view?token=${this.token}&event_id=${eventId}`;
      
      this.logger.log(`Fetching match details for event: ${eventId}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      this.logger.log(`Fetched match details for event: ${eventId}`);
      
      return data;
    } catch (error) {
      this.logger.error(`Error fetching match details for event ${eventId}:`, error);
      throw new Error(`Failed to fetch match details: ${error.message}`);
    }
  }

  /**
   * 리그 목록 조회 (v1 API)
   */
  async getLeagues(page: number = 1): Promise<BetsApiLeaguesResponse> {
    try {
      const url = `${this.baseUrl}/v1/league?sport_id=1&token=${this.token}&page=${page}`;
      
      this.logger.log(`Fetching leagues from: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: BetsApiLeaguesResponse = await response.json();
      
      this.logger.log(`Fetched ${data.results?.length || 0} leagues (Total: ${data.pager?.total || 0})`);
      
      return data;
    } catch (error) {
      this.logger.error('Error fetching leagues:', error);
      throw new Error(`Failed to fetch leagues: ${error.message}`);
    }
  }

  /**
   * 리그 테이블 조회 (v3 API)
   */
  async getLeagueTable(leagueId: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/v3/league/table?token=${this.token}&league_id=${leagueId}`;
      
      this.logger.log(`Fetching league table for league: ${leagueId}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      this.logger.log(`Fetched league table for league: ${leagueId}`);
      
      return data;
    } catch (error) {
      this.logger.error(`Error fetching league table for league ${leagueId}:`, error);
      throw new Error(`Failed to fetch league table: ${error.message}`);
    }
  }

  /**
   * 특정 리그의 경기만 조회
   */
  async getLeagueMatches(
    leagueId: string, 
    type: MatchType = 'upcoming', 
    page: number = 1,
    day?: string
  ): Promise<BetsApiUpcomingResponse | BetsApiInplayResponse | BetsApiEndedResponse> {
    try {
      let url = '';
      
      switch (type) {
        case 'upcoming':
          url = `${this.baseUrl}/v3/events/upcoming?sport_id=1&league_id=${leagueId}&token=${this.token}&page=${page}`;
          if (day) url += `&day=${day}`;
          break;
        case 'inplay':
          url = `${this.baseUrl}/v3/events/inplay?sport_id=1&league_id=${leagueId}&token=${this.token}`;
          // inplay는 현재 진행 중인 경기만이므로 day 파라미터 불필요
          break;
        case 'ended':
          url = `${this.baseUrl}/v3/events/ended?sport_id=1&league_id=${leagueId}&token=${this.token}&page=${page}`;
          if (day) url += `&day=${day}`;
          break;
      }
      
      this.logger.log(`Fetching ${type} matches for league ${leagueId} from: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      this.logger.log(`Fetched ${data.results?.length || 0} ${type} matches for league ${leagueId}`);
      
      return data;
    } catch (error) {
      this.logger.error(`Error fetching ${type} matches for league ${leagueId}:`, error);
      throw new Error(`Failed to fetch ${type} matches for league: ${error.message}`);
    }
  }

  /**
   * 경기 상태별 필터링 유틸리티 메소드
   */
  filterMatchesByStatus(matches: BetsApiFixture[], status: MatchTimeStatus): BetsApiFixture[] {
    return matches.filter(match => match.time_status === status);
  }

  /**
   * 경기 시간 포맷팅 유틸리티 메소드
   */
  formatMatchTime(timestamp: string): string {
    const matchTime = new Date(parseInt(timestamp) * 1000);
    return matchTime.toLocaleString('ko-KR', { 
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * 경기 상태 텍스트 변환 유틸리티 메소드
   */
  getMatchStatusText(status: MatchTimeStatus): string {
    switch (status) {
      case MatchTimeStatus.SCHEDULED:
        return '예정';
      case MatchTimeStatus.IN_PLAY:
        return '진행중';
      case MatchTimeStatus.HALFTIME:
        return '하프타임';
      case MatchTimeStatus.FINISHED:
        return '종료';
      case MatchTimeStatus.POSTPONED:
        return '연기';
      case MatchTimeStatus.CANCELLED:
        return '취소';
      default:
        return '알 수 없음';
    }
  }

  /**
   * 통계 데이터 파싱 유틸리티 메소드
   */
  parseStatsArray(statsArray: [string, string] | undefined): { home: number; away: number } | null {
    if (!statsArray || statsArray.length !== 2) {
      return null;
    }
    
    return {
      home: parseInt(statsArray[0]) || 0,
      away: parseInt(statsArray[1]) || 0,
    };
  }

  /**
   * 날짜를 YYYYMMDD 형식으로 변환하는 유틸리티 메소드
   */
  formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * 오늘 날짜를 YYYYMMDD 형식으로 가져오기
   */
  getTodayFormatted(): string {
    return this.formatDateForAPI(new Date());
  }

  /**
   * 어제 날짜를 YYYYMMDD 형식으로 가져오기
   */
  getYesterdayFormatted(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.formatDateForAPI(yesterday);
  }

  /**
   * 내일 날짜를 YYYYMMDD 형식으로 가져오기
   */
  getTomorrowFormatted(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.formatDateForAPI(tomorrow);
  }

  /**
   * 특정 날짜의 모든 경기 조회 (편의 메소드)
   */
  async getAllMatchesForDate(date: string) {
    const [upcomingMatches, endedMatches] = await Promise.all([
      this.getUpcomingMatches(1, date),
      this.getEndedMatches(1, date),
    ]);

    return {
      upcoming: upcomingMatches,
      ended: endedMatches,
      summary: {
        total_upcoming: upcomingMatches.results?.length || 0,
        total_ended: endedMatches.results?.length || 0,
        date: date,
      }
    };
  }

  /**
   * 날짜 범위의 경기 조회 (편의 메소드)
   */
  async getMatchesForDateRange(startDate: string, endDate: string, type: MatchType = 'ended'): Promise<DateRangeMatchesResponse> {
    const matches: DayMatches[] = [];
    const start = new Date(startDate.substring(0, 4) + '-' + startDate.substring(4, 6) + '-' + startDate.substring(6, 8));
    const end = new Date(endDate.substring(0, 4) + '-' + endDate.substring(4, 6) + '-' + endDate.substring(6, 8));
    
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dateStr = this.formatDateForAPI(currentDate);
      
      try {
        let dayMatches: BetsApiUpcomingResponse | BetsApiEndedResponse | undefined;
        if (type === 'upcoming') {
          dayMatches = await this.getUpcomingMatches(1, dateStr);
        } else if (type === 'ended') {
          dayMatches = await this.getEndedMatches(1, dateStr);
        }
        
        if (dayMatches?.results?.length && dayMatches.results.length > 0) {
          matches.push({
            date: dateStr,
            matches: dayMatches.results,
            total: dayMatches.results.length
          });
        }
      } catch (error) {
        this.logger.warn(`Failed to fetch matches for date ${dateStr}: ${error.message}`);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return {
      results: matches,
      summary: {
        total_days: matches.length,
        total_matches: matches.reduce((sum, day) => sum + day.total, 0),
        date_range: { start: startDate, end: endDate }
      }
    };
  }
}