import { Body, Controller, Get, Post, Query, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiExtraModels, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { CountriesService } from '@/modules/countries/services/countries.service';
import { SportsCategoriesService } from '@/modules/sports-categories/services/sports-categories.service';

import { CreateLeagueDto, CreateLeagueResponse } from '../dtos/create-league.dto';
import { LeaguesResponse, LeagueResponse } from '../dtos/leagues.dto';
import { UpdateLeagueDto, UpdateLeagueResponse } from '../dtos/update-league.dto';
import { LeaguesService } from '../services/leagues.service';

@ApiTags('Leagues')
@Controller('/api/v1/leagues')
export class LeaguesController {
  constructor(
    private readonly leaguesService: LeaguesService,
    private readonly countriesService: CountriesService,
    private readonly sportsCategoriesService: SportsCategoriesService,
  ) {}

  @Post('')
  @ApiOperation({
    summary: '리그 생성 API',
    description: '리그 생성 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 201, description: 'The league has been successfully created.' })
  @ApiExtraModels(CreateLeagueDto)
  async create(@Body() createLeagueDto: CreateLeagueDto) {
    const createdLeague = await this.leaguesService.create(createLeagueDto);

    return CreateLeagueResponse.ok(createdLeague);
  }

  @Get('')
  @ApiOperation({
    summary: '리그 목록 조회 API',
    description: 'offset based pagination 리그 목록 조회 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 200, description: 'The leagues have been successfully retrieved.' })
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
    const { results: leagues, totalCount } = await this.leaguesService.getAll({
      skip: Number(skip),
      limit: Number(limit),
    });

    const countires = await Promise.all(
      leagues.map((league) => this.countriesService.getById(league.countryId.toString())),
    );
    const sportsCategories = await Promise.all(
      leagues.map((league) => this.sportsCategoriesService.getById(league.sportsCategoryId.toString())),
    );

    return LeaguesResponse.ok({
      result: leagues.map((league, i) => ({
        ...league.toJSON(),
        country: countires[i],
        sportsCategory: sportsCategories[i],
      })),
      totalCount,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: '리그 단건 조회 API',
    description: '리그 단건 조회 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 200, description: 'The league has been successfully retrieved.' })
  async getById(@Param('id') id: string) {
    const league = await this.leaguesService.getById(id);

    const country = await this.countriesService.getById(league.countryId.toString());
    const sportsCategory = await this.sportsCategoriesService.getById(league.sportsCategoryId.toString());

    return LeagueResponse.ok({
      ...league.toJSON(),
      country,
      sportsCategory,
    });
  }

  @Patch(':id')
  @ApiOperation({
    summary: '리그 수정 API',
    description: '리그 수정 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 200, description: 'The league has been successfully updated.' })
  @ApiExtraModels(UpdateLeagueDto)
  async update(@Param('id') id: string, @Body() updateLeagueDto: UpdateLeagueDto) {
    const updatedLeague = await this.leaguesService.update(id, updateLeagueDto);

    return UpdateLeagueResponse.ok(updatedLeague);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '리그 삭제 API',
    description: '리그 삭제 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 200, description: 'The league has been successfully deleted.' })
  async softDelete(@Param('id') id: string) {
    const deletedLeague = await this.leaguesService.softDelete(id);

    return LeagueResponse.ok(deletedLeague);
  }
}
