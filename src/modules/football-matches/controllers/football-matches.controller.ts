// src/modules/football-matches/controllers/football-matches.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Patch, // 🆕 추가
  Delete, 
  Body, 
  Param, 
  Query 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiQuery,
  ApiParam,
  ApiBody 
} from '@nestjs/swagger';
import { FootballMatchesService } from '../services/football-matches.service';
import { CreateFootballMatchDto, CreateFootballMatchResponse } from '../dtos/create-football-match.dto';
import { UpdateFootballMatchDto, UpdateFootballMatchResponse } from '../dtos/update-football-match.dto';
import { FootballMatchesResponse, FootballMatchResponse } from '../dtos/football-matches.dto';

@ApiTags('Football Matches Management')
@Controller('/api/v1/football-matches')
export class FootballMatchesController {
  constructor(private readonly footballMatchesService: FootballMatchesService) {}

  @Post()
  @ApiOperation({
    summary: '축구 경기 생성',
    description: '새로운 축구 경기를 생성합니다. (관리자가 직접 추가)',
  })
  @ApiResponse({ 
    status: 201, 
    description: '축구 경기가 성공적으로 생성되었습니다.',
    type: CreateFootballMatchResponse
  })
  @ApiBody({ type: CreateFootballMatchDto })
  async create(@Body() createDto: CreateFootballMatchDto) {
    const createdMatch = await this.footballMatchesService.create(createDto);
    return CreateFootballMatchResponse.ok(createdMatch);
  }

  @Get()
  @ApiOperation({
    summary: '축구 경기 목록 조회',
    description: '저장된 축구 경기 목록을 페이지네이션으로 조회합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: '축구 경기 목록이 성공적으로 조회되었습니다.',
    type: FootballMatchesResponse
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    default: 0,
    description: '건너뛸 항목 수',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    default: 20,
    description: '조회할 항목 수',
  })
  async getAll(
    @Query('skip') skip: number = 0,
    @Query('limit') limit: number = 20,
  ) {
    const matches = await this.footballMatchesService.getAll({ 
      skip: Number(skip), 
      limit: Number(limit) 
    });
    return FootballMatchesResponse.ok(matches);
  }

  @Get('by-status/:status')
  @ApiOperation({
    summary: '상태별 축구 경기 조회',
    description: '경기 상태에 따라 축구 경기를 조회합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: '상태별 축구 경기가 성공적으로 조회되었습니다.',
    type: FootballMatchesResponse
  })
  @ApiParam({
    name: 'status',
    description: '경기 상태 (0: 예정, 1: 진행중, 3: 종료)',
    enum: ['0', '1', '3'],
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '조회할 항목 수',
  })
  async getByStatus(
    @Param('status') status: string,
    @Query('limit') limit?: number,
  ) {
    const matches = await this.footballMatchesService.getByTimeStatus(status, limit);
    return FootballMatchesResponse.ok({ results: matches, totalCount: matches.length });
  }

  @Get(':id')
  @ApiOperation({
    summary: '축구 경기 상세 조회',
    description: '특정 축구 경기의 상세 정보를 조회합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: '축구 경기 상세 정보가 성공적으로 조회되었습니다.',
    type: FootballMatchResponse
  })
  @ApiParam({
    name: 'id',
    description: '축구 경기 ID (MongoDB ObjectId)',
  })
  async getById(@Param('id') id: string) {
    const match = await this.footballMatchesService.getById(id);
    return FootballMatchResponse.ok(match);
  }

  // 🆕 PATCH 엔드포인트 추가 (부분 업데이트용)
  @Patch(':id')
  @ApiOperation({
    summary: '축구 경기 부분 수정',
    description: '축구 경기의 특정 필드만 수정합니다. (동기화 허용 상태 등)',
  })
  @ApiResponse({ 
    status: 200, 
    description: '축구 경기가 성공적으로 수정되었습니다.',
    type: UpdateFootballMatchResponse
  })
  @ApiParam({
    name: 'id',
    description: '축구 경기 ID (MongoDB ObjectId)',
  })
  @ApiBody({ 
    type: UpdateFootballMatchDto,
    description: '수정할 필드들 (부분 업데이트)',
    examples: {
      syncToggle: {
        summary: '동기화 허용 상태 변경',
        value: { allowSync: false }
      },
      quickUpdate: {
        summary: '빠른 수정',
        value: { 
          allowSync: true,
          adminNote: '관리자가 수정함'
        }
      }
    }
  })
  async patch(
    @Param('id') id: string,
    @Body() patchDto: UpdateFootballMatchDto,
  ) {
    const updatedMatch = await this.footballMatchesService.update(id, patchDto);
    return UpdateFootballMatchResponse.ok(updatedMatch);
  }

  @Put(':id')
  @ApiOperation({
    summary: '축구 경기 전체 수정',
    description: '축구 경기 정보를 전체적으로 수정합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: '축구 경기가 성공적으로 수정되었습니다.',
    type: UpdateFootballMatchResponse
  })
  @ApiParam({
    name: 'id',
    description: '축구 경기 ID (MongoDB ObjectId)',
  })
  @ApiBody({ type: UpdateFootballMatchDto })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateFootballMatchDto,
  ) {
    const updatedMatch = await this.footballMatchesService.update(id, updateDto);
    return UpdateFootballMatchResponse.ok(updatedMatch);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '축구 경기 삭제',
    description: '축구 경기를 소프트 삭제합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: '축구 경기가 성공적으로 삭제되었습니다.',
    type: FootballMatchResponse
  })
  @ApiParam({
    name: 'id',
    description: '축구 경기 ID (MongoDB ObjectId)',
  })
  async softDelete(@Param('id') id: string) {
    const deletedMatch = await this.footballMatchesService.softDelete(id);
    return FootballMatchResponse.ok(deletedMatch);
  }

  @Delete(':id/hard')
  @ApiOperation({
    summary: '축구 경기 완전 삭제',
    description: '축구 경기를 완전히 삭제합니다. (복구 불가)',
  })
  @ApiResponse({ 
    status: 200, 
    description: '축구 경기가 완전히 삭제되었습니다.',
  })
  @ApiParam({
    name: 'id',
    description: '축구 경기 ID (MongoDB ObjectId)',
  })
  async hardDelete(@Param('id') id: string) {
    await this.footballMatchesService.hardDelete(id);
    return { 
      success: true, 
      message: '축구 경기가 완전히 삭제되었습니다.' 
    };
  }

  @Post('sync')
  @ApiOperation({
    summary: 'BetsAPI 데이터 동기화',
    description: 'BetsAPI에서 가져온 데이터를 로컬 데이터베이스에 동기화합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'BetsAPI 데이터 동기화가 완료되었습니다.',
  })
  @ApiBody({
    description: 'BetsAPI에서 가져온 경기 데이터 배열',
    schema: {
      type: 'object',
      properties: {
        matches: {
          type: 'array',
          items: { type: 'object' }
        }
      }
    }
  })
  async syncFromBetsApi(@Body() body: { matches: any[] }) {
    const result = await this.footballMatchesService.syncFromBetsApi(body.matches);
    return {
      success: true,
      data: result,
      message: `동기화 완료: ${result.created}개 생성, ${result.updated}개 업데이트`
    };
  }
}