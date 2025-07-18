// src/modules/betsapi/controllers/enhanced-betsapi.controller.ts
import { Controller, Get, Post, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { EnhancedBetsApiService } from '../services/enhanced-betsapi.service';
import { MatchType } from '../types/betsapi.types';
import { EnhancedMatchResponse } from '../../football-matches/types/football-match.types';

@ApiTags('Enhanced BetsAPI - DB First Football Data Management')
@Controller('/api/v1/enhanced-football')
export class EnhancedBetsApiController {
  constructor(private readonly enhancedBetsApiService: EnhancedBetsApiService) {}

  @Get('matches/upcoming')
  @ApiOperation({
    summary: 'DB 저장된 예정 경기 조회',
    description: 'DB에 저장된 예정 축구 경기만 조회합니다. 데이터가 없으면 자동 동기화를 먼저 실행하세요.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'DB 저장된 예정 경기 목록이 성공적으로 조회되었습니다.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            results: { type: 'array' },
            pager: { type: 'object' },
            enhanced: { type: 'boolean' },
            stats: { type: 'object' }
          }
        },
        message: { type: 'string' }
      }
    }
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    default: 1,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'day',
    required: false,
    type: String,
    description: 'Filter by specific day (YYYYMMDD format)',
  })
  async getEnhancedUpcomingMatches(
    @Query('page') page: number = 1,
    @Query('day') day?: string,
  ): Promise<{ success: boolean; data: EnhancedMatchResponse; message: string }> {
    const matches = await this.enhancedBetsApiService.getEnhancedMatches(
      'upcoming', 
      Number(page), 
      day
    );
    
    return {
      success: true,
      data: matches,
      message: 'DB stored upcoming matches retrieved successfully'
    };
  }

  @Get('matches/inplay')
  @ApiOperation({
    summary: 'DB 저장된 진행중 경기 조회',
    description: 'DB에 저장된 진행 중인 축구 경기만 조회합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'DB 저장된 진행중 경기 목록이 성공적으로 조회되었습니다.',
  })
  async getEnhancedInplayMatches(): Promise<{ success: boolean; data: EnhancedMatchResponse; message: string }> {
    const matches = await this.enhancedBetsApiService.getEnhancedMatches('inplay', 1);
    
    return {
      success: true,
      data: matches,
      message: 'DB stored inplay matches retrieved successfully'
    };
  }

  @Get('matches/ended')
  @ApiOperation({
    summary: 'DB 저장된 종료 경기 조회',
    description: 'DB에 저장된 종료된 축구 경기만 조회합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'DB 저장된 종료 경기 목록이 성공적으로 조회되었습니다.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    default: 1,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'day',
    required: false,
    type: String,
    description: 'Filter by specific day (YYYYMMDD format)',
  })
  async getEnhancedEndedMatches(
    @Query('page') page: number = 1,
    @Query('day') day?: string,
  ): Promise<{ success: boolean; data: EnhancedMatchResponse; message: string }> {
    const matches = await this.enhancedBetsApiService.getEnhancedMatches(
      'ended', 
      Number(page), 
      day
    );
    
    return {
      success: true,
      data: matches,
      message: 'DB stored ended matches retrieved successfully'
    };
  }

  @Get('match/:eventId')
  @ApiOperation({
    summary: 'DB 저장된 경기 상세 조회',
    description: 'DB에 저장된 특정 경기의 상세 정보를 조회합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'DB 저장된 경기 상세 정보가 성공적으로 조회되었습니다.',
  })
  @ApiParam({
    name: 'eventId',
    type: String,
    description: 'BetsAPI Event ID',
    example: '10150692',
  })
  async getEnhancedMatchDetails(@Param('eventId') eventId: string) {
    const matchDetails = await this.enhancedBetsApiService.getEnhancedMatchDetails(eventId);
    return {
      success: true,
      data: matchDetails,
      message: 'DB stored match details retrieved successfully'
    };
  }

  @Post('sync/auto/:type')
  @ApiOperation({
    summary: 'BetsAPI → DB 자동 동기화',
    description: 'BetsAPI에서 특정 타입의 경기를 가져와 DB에 저장합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'BetsAPI → DB 자동 동기화가 성공적으로 완료되었습니다.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            created: { type: 'number' },
            updated: { type: 'number' }
          }
        },
        message: { type: 'string' }
      }
    }
  })
  @ApiParam({
    name: 'type',
    enum: ['upcoming', 'inplay', 'ended'],
    description: 'Match type to sync from BetsAPI',
    example: 'upcoming',
  })
  @ApiQuery({
    name: 'day',
    required: false,
    type: String,
    description: 'Specific day to sync (YYYYMMDD format). If not provided, syncs current data.',
  })
  async autoSync(
    @Param('type') type: MatchType,
    @Query('day') day?: string,
  ) {
    const result = await this.enhancedBetsApiService.autoSyncMatches(type, day);
    return {
      success: true,
      data: result,
      message: `BetsAPI → DB sync completed: ${result.created} created, ${result.updated} updated`
    };
  }

  @Post('sync/full')
  @ApiOperation({
    summary: 'BetsAPI → DB 전체 동기화',
    description: 'BetsAPI에서 오늘과 내일의 모든 경기를 가져와 DB에 저장합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'BetsAPI → DB 전체 동기화가 성공적으로 완료되었습니다.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            upcoming: { type: 'object' },
            ended: { type: 'object' },
            total: { type: 'object' }
          }
        },
        message: { type: 'string' }
      }
    }
  })
  async fullSync() {
    const result = await this.enhancedBetsApiService.fullSync();
    return {
      success: true,
      data: result,
      message: `BetsAPI → DB full sync completed: ${result.total.created} total created, ${result.total.updated} total updated`
    };
  }

  @Get('stats/db')
  @ApiOperation({
    summary: 'DB 저장된 경기 통계',
    description: 'DB에 저장된 경기들의 통계를 조회합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'DB 경기 통계가 성공적으로 조회되었습니다.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            upcoming: { type: 'number' },
            inplay: { type: 'number' },
            ended: { type: 'number' },
            total: { type: 'number' }
          }
        },
        message: { type: 'string' }
      }
    }
  })
  async getDbStats() {
    const stats = await this.enhancedBetsApiService.getDbMatchesCount();
    return {
      success: true,
      data: stats,
      message: 'DB match statistics retrieved successfully'
    };
  }

  @Get('check/sync-needed')
  @ApiOperation({
    summary: '동기화 필요 여부 확인',
    description: 'DB에 데이터가 있는지 확인하여 동기화가 필요한지 알려줍니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: '동기화 필요 여부가 성공적으로 확인되었습니다.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            syncNeeded: { type: 'boolean' },
            dbStats: { type: 'object' },
            recommendation: { type: 'string' }
          }
        },
        message: { type: 'string' }
      }
    }
  })
  async checkSyncNeeded() {
    const dbStats = await this.enhancedBetsApiService.getDbMatchesCount();
    const syncNeeded = dbStats.total === 0;
    
    let recommendation = '';
    if (syncNeeded) {
      recommendation = 'DB에 데이터가 없습니다. "전체 동기화"를 실행하여 BetsAPI에서 데이터를 가져오세요.';
    } else if (dbStats.upcoming === 0) {
      recommendation = '예정된 경기가 없습니다. "예정 경기 동기화"를 실행하세요.';
    } else {
      recommendation = 'DB에 충분한 데이터가 있습니다.';
    }
    
    return {
      success: true,
      data: {
        syncNeeded,
        dbStats,
        recommendation,
      },
      message: 'Sync requirement check completed'
    };
  }
}