import { Body, Controller, Get, Post, Query, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiExtraModels, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { LeaguesService } from '@/modules/leagues/services/leagues.service';

import { CreateLeagueSeasonDto, CreateLeagueSeasonResponse } from '../dtos/create-league-season.dto';
import { LeagueSeasonsResponse, LeagueSeasonResponse } from '../dtos/league-seasons.dto';
import { UpdateLeagueSeasonDto, UpdateLeagueSeasonResponse } from '../dtos/update-league-season.dto';
import { LeagueSeasonsService } from '../services/league-seasons.service';

@ApiTags('League Seasons')
@Controller('/api/v1/league-seasons')
export class LeagueSeasonsController {
  constructor(
    private readonly leagueSeasonsService: LeagueSeasonsService,
    private readonly leaguesService: LeaguesService,
  ) {}

  @Post('')
  @ApiOperation({
    summary: '리그 시즌 생성 API',
    description: '리그 시즌 생성 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 201, description: 'The league season has been successfully created.' })
  @ApiExtraModels(CreateLeagueSeasonDto)
  async create(@Body() createLeagueSeasonDto: CreateLeagueSeasonDto) {
    const createdLeagueSeason = await this.leagueSeasonsService.create(createLeagueSeasonDto);

    return CreateLeagueSeasonResponse.ok(createdLeagueSeason);
  }

  @Get('')
  @ApiOperation({
    summary: '리그 시즌 목록 조회 API',
    description: 'offset based pagination 리그 시즌 목록 조회 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 200, description: 'The league seasons have been successfully retrieved.' })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    default: 0,
    description: 'Number of items to skip for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,

    type: Number,
    default: 10,
    description: 'Number of items to limit for pagination',
  })
  async getAll(
    @Query('skip', { transform: (value) => Number(value || 0) }) skip: number = 0,
    @Query('limit', { transform: (value) => Number(value || 10) }) limit: number = 10,
  ) {
    const { results: leagueSeasons, totalCount } = await this.leagueSeasonsService.getAll({
      skip: Number(skip),
      limit: Number(limit),
    });

    const leagues = await Promise.all(
      leagueSeasons.map((leagueSeason) => this.leaguesService.getById(leagueSeason.leagueId.toString())),
    );
    const ranks = await this.leagueSeasonsService.getRanksWithTeams(leagueSeasons);

    return LeagueSeasonsResponse.ok({
      result: leagueSeasons.map((leagueSeasons, i) => ({
        ...leagueSeasons.toJSON(),
        league: leagues[i],
        ranks: ranks[i],
      })),
      totalCount,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: '리그 시즌 단건 조회 API',
    description: '리그 시즌 단건 조회 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 200, description: 'The league season has been successfully retrieved.' })
  async getById(@Param('id') id: string) {
    const leagueSeason = await this.leagueSeasonsService.getById(id);

    const league = await this.leaguesService.getById(leagueSeason.leagueId.toString());
    const [ranks] = await this.leagueSeasonsService.getRanksWithTeams([leagueSeason]);

    return LeagueSeasonResponse.ok({
      ...leagueSeason.toJSON(),
      league,
      ranks: ranks,
    });
  }

  @Patch(':id')
  @ApiOperation({
    summary: '리그 시즌 수정 API',
    description: '리그 시즌 수정 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 200, description: 'The league season has been successfully updated.' })
  @ApiExtraModels(UpdateLeagueSeasonDto)
  async update(@Param('id') id: string, @Body() updateLeagueSeasonDto: UpdateLeagueSeasonDto) {
    const updatedLeagueSeason = await this.leagueSeasonsService.update(id, updateLeagueSeasonDto);

    return UpdateLeagueSeasonResponse.ok(updatedLeagueSeason);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '리그 시즌 삭제 API',
    description: '리그 시즌 삭제 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 200, description: 'The league season has been successfully deleted.' })
  async softDelete(@Param('id') id: string) {
    const deletedLeagueSeason = await this.leagueSeasonsService.softDelete(id);

    return LeagueSeasonResponse.ok(deletedLeagueSeason);
  }
}
