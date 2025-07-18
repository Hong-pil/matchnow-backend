// src/modules/betsapi/controllers/betsapi.controller.ts
import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';

import { BetsApiService } from '../services/betsapi.service';
import { MatchType } from '../types/betsapi.types';

@ApiTags('BetsAPI - Football Data')
@Controller('/api/v1/football')
export class BetsApiController {
  constructor(private readonly betsApiService: BetsApiService) {}

  // ============================================
  // 예정된 경기 조회
  // ============================================
  @Get('matches/upcoming')
  @ApiOperation({
    summary: '예정된 축구 경기 목록 조회',
    description: 'BetsAPI v3를 통해 예정된 축구 경기 목록을 조회합니다. time_status=0인 경기들만 반환됩니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved upcoming matches.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        message: { type: 'string' }
      }
    }
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    default: 1,
    description: 'Page number for pagination (1부터 시작)',
  })
  @ApiQuery({
    name: 'league_id',
    required: false,
    type: String,
    description: 'Filter by specific league ID',
  })
  @ApiQuery({
    name: 'day',
    required: false,
    type: String,
    description: 'Filter by specific day (YYYYMMDD format, e.g., 20241225)',
  })
  async getUpcomingMatches(
    @Query('page', { transform: (value) => Number(value || 1) }) page: number = 1,
    @Query('league_id') leagueId?: string,
    @Query('day') day?: string,
  ) {
    let matches;
    
    if (leagueId) {
      matches = await this.betsApiService.getLeagueMatches(leagueId, 'upcoming', page, day);
    } else {
      matches = await this.betsApiService.getUpcomingMatches(page, day);
    }
    
    return {
      success: true,
      data: matches,
      message: 'Successfully retrieved upcoming matches'
    };
  }

  // ============================================
  // 진행 중인 경기 조회
  // ============================================
  @Get('matches/inplay')
  @ApiOperation({
    summary: '진행 중인 축구 경기 목록 조회',
    description: 'BetsAPI v3를 통해 현재 진행 중인 축구 경기 목록을 조회합니다. time_status=1인 경기들만 반환됩니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved inplay matches.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        message: { type: 'string' }
      }
    }
  })
  @ApiQuery({
    name: 'league_id',
    required: false,
    type: String,
    description: 'Filter by specific league ID',
  })
  async getInplayMatches(@Query('league_id') leagueId?: string) {
    let matches;
    
    if (leagueId) {
      matches = await this.betsApiService.getLeagueMatches(leagueId, 'inplay');
    } else {
      matches = await this.betsApiService.getInplayMatches();
    }
    
    return {
      success: true,
      data: matches,
      message: 'Successfully retrieved inplay matches'
    };
  }

  // ============================================
  // 종료된 경기 조회
  // ============================================
  @Get('matches/ended')
  @ApiOperation({
    summary: '종료된 축구 경기 목록 조회',
    description: 'BetsAPI v3를 통해 종료된 축구 경기 목록을 조회합니다. time_status=3,4,5인 경기들이 반환됩니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved ended matches.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        message: { type: 'string' }
      }
    }
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    default: 1,
    description: 'Page number for pagination (1부터 시작)',
  })
  @ApiQuery({
    name: 'league_id',
    required: false,
    type: String,
    description: 'Filter by specific league ID',
  })
  @ApiQuery({
    name: 'day',
    required: false,
    type: String,
    description: 'Filter by specific day (YYYYMMDD format, e.g., 20241225)',
  })
  async getEndedMatches(
    @Query('page', { transform: (value) => Number(value || 1) }) page: number = 1,
    @Query('league_id') leagueId?: string,
    @Query('day') day?: string,
  ) {
    let matches;
    
    if (leagueId) {
      matches = await this.betsApiService.getLeagueMatches(leagueId, 'ended', page, day);
    } else {
      matches = await this.betsApiService.getEndedMatches(page, day);
    }
    
    return {
      success: true,
      data: matches,
      message: 'Successfully retrieved ended matches'
    };
  }

  // ============================================
  // 경기 상세 정보 조회
  // ============================================
  @Get('match/:eventId')
  @ApiOperation({
    summary: '축구 경기 상세 정보 조회',
    description: 'BetsAPI v1을 통해 특정 축구 경기의 상세 정보를 조회합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved match details.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        message: { type: 'string' }
      }
    }
  })
  @ApiParam({
    name: 'eventId',
    type: String,
    description: 'Event ID of the match',
    example: '10150692',
  })
  async getMatchDetails(@Param('eventId') eventId: string) {
    const matchDetails = await this.betsApiService.getMatchDetails(eventId);
    return {
      success: true,
      data: matchDetails,
      message: 'Successfully retrieved match details'
    };
  }

  // ============================================
  // 리그 목록 조회
  // ============================================
  @Get('leagues')
  @ApiOperation({
    summary: '축구 리그 목록 조회',
    description: 'BetsAPI v1을 통해 축구 리그 목록을 조회합니다. has_leaguetable과 has_toplist 정보도 포함됩니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved leagues.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        message: { type: 'string' }
      }
    }
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    default: 1,
    description: 'Page number for pagination (1부터 시작)',
  })
  async getLeagues(
    @Query('page', { transform: (value) => Number(value || 1) }) page: number = 1,
  ) {
    const leagues = await this.betsApiService.getLeagues(page);
    return {
      success: true,
      data: leagues,
      message: 'Successfully retrieved leagues'
    };
  }

  // ============================================
  // 리그 순위표 조회
  // ============================================
  @Get('league/:leagueId/table')
  @ApiOperation({
    summary: '리그 순위표 조회',
    description: 'BetsAPI v3를 통해 특정 리그의 순위표를 조회합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved league table.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        message: { type: 'string' }
      }
    }
  })
  @ApiParam({
    name: 'leagueId',
    type: String,
    description: 'League ID',
    example: '39521',
  })
  async getLeagueTable(@Param('leagueId') leagueId: string) {
    const leagueTable = await this.betsApiService.getLeagueTable(leagueId);
    return {
      success: true,
      data: leagueTable,
      message: 'Successfully retrieved league table'
    };
  }

  // ============================================
  // 특정 리그의 경기 목록 조회
  // ============================================
  @Get('league/:leagueId/matches/:type')
  @ApiOperation({
    summary: '특정 리그의 경기 목록 조회',
    description: '특정 리그의 예정/진행중/종료된 경기 목록을 조회합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved league matches.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        message: { type: 'string' }
      }
    }
  })
  @ApiParam({
    name: 'leagueId',
    type: String,
    description: 'League ID',
    example: '39521',
  })
  @ApiParam({
    name: 'type',
    enum: ['upcoming', 'inplay', 'ended'],
    description: 'Match type to retrieve',
    example: 'upcoming',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    default: 1,
    description: 'Page number for pagination (upcoming, ended only)',
  })
  @ApiQuery({
    name: 'day',
    required: false,
    type: String,
    description: 'Filter by specific day (YYYYMMDD format, upcoming/ended only)',
  })
  async getLeagueMatches(
    @Param('leagueId') leagueId: string,
    @Param('type') type: MatchType,
    @Query('page', { transform: (value) => Number(value || 1) }) page: number = 1,
    @Query('day') day?: string,
  ) {
    const matches = await this.betsApiService.getLeagueMatches(leagueId, type, page, day);
    return {
      success: true,
      data: matches,
      message: 'Successfully retrieved league matches'
    };
  }

  // ============================================
  // 경기 통계 요약 정보 조회
  // ============================================
  @Get('matches/stats/summary')
  @ApiOperation({
    summary: '경기 통계 요약 정보',
    description: '현재 진행 중인 경기들의 통계 요약 정보를 제공합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved match statistics summary.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        message: { type: 'string' }
      }
    }
  })
  async getMatchStatsSummary() {
    const inplayMatches = await this.betsApiService.getInplayMatches();
    
    const summary = {
      total_inplay_matches: inplayMatches.results?.length || 0,
      matches_with_stats: inplayMatches.results?.filter(match => 'stats' in match && match.stats).length || 0,
      leagues_in_play: [...new Set(inplayMatches.results?.map(match => match.league.id) || [])].length,
      total_goals: inplayMatches.results?.reduce((total, match) => {
        if ('stats' in match && match.stats?.goals) {
          const homeGoals = parseInt(match.stats.goals[0]) || 0;
          const awayGoals = parseInt(match.stats.goals[1]) || 0;
          return total + homeGoals + awayGoals;
        }
        return total;
      }, 0) || 0,
    };
    
    return {
      success: true,
      data: summary,
      message: 'Successfully retrieved match statistics summary'
    };
  }

  // ============================================
  // 오늘의 하이라이트 경기 조회
  // ============================================
  @Get('matches/highlights')
  @ApiOperation({
    summary: '오늘의 하이라이트 경기',
    description: '높은 점수차, 많은 골, 주요 리그 등을 기준으로 한 하이라이트 경기들을 조회합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved highlight matches.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        message: { type: 'string' }
      }
    }
  })
  async getHighlightMatches() {
    const [inplayMatches, endedMatches] = await Promise.all([
      this.betsApiService.getInplayMatches(),
      this.betsApiService.getEndedMatches(1),
    ]);

    // 진행 중인 경기에서 많은 골이 나오고 있는 경기
    const highScoringInplay = inplayMatches.results?.filter(match => {
      if ('stats' in match && match.stats?.goals) {
        const homeGoals = parseInt(match.stats.goals[0]) || 0;
        const awayGoals = parseInt(match.stats.goals[1]) || 0;
        return (homeGoals + awayGoals) >= 3;
      }
      return false;
    }).slice(0, 5) || [];

    // 종료된 경기에서 높은 점수의 경기
    const highScoringEnded = endedMatches.results?.filter(match => {
      if (match.ss) {
        const [homeScore, awayScore] = match.ss.split('-').map(s => parseInt(s) || 0);
        return (homeScore + awayScore) >= 4;
      }
      return false;
    }).slice(0, 5) || [];

    const highlights = {
      high_scoring_inplay: highScoringInplay,
      high_scoring_ended: highScoringEnded,
      stats: {
        total_inplay_matches: inplayMatches.results?.length || 0,
        total_ended_matches: endedMatches.pager?.total || 0,
        high_scoring_inplay_count: highScoringInplay.length,
        high_scoring_ended_count: highScoringEnded.length,
      }
    };

    return {
      success: true,
      data: highlights,
      message: 'Successfully retrieved highlight matches'
    };
  }
}