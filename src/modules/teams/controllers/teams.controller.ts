import { Body, Controller, Get, Post, Query, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiExtraModels, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { PlayersService } from '@/modules/players/services/players.service';
import { CountriesService } from '@/modules/countries/services/countries.service';
import { SportsCategoriesService } from '@/modules/sports-categories/services/sports-categories.service';

import { CreateTeamDto, CreateTeamResponse } from '../dtos/create-team.dto';
import { TeamsResponse, TeamResponse } from '../dtos/teams.dto';
import { UpdateTeamDto, UpdateTeamResponse } from '../dtos/update-team.dto';
import { TeamsService } from '../services/teams.service';

@ApiTags('Teams')
@Controller('/api/v1/teams')
export class TeamsController {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly playersService: PlayersService,
    private readonly countriesService: CountriesService,
    private readonly sportsCategoriesService: SportsCategoriesService,
  ) {}

  @Post('')
  @ApiOperation({
    summary: '팀 생성 API',
    description: '팀 생성 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 201, description: 'The team has been successfully created.' })
  @ApiExtraModels(CreateTeamDto)
  async create(@Body() createTeamDto: CreateTeamDto) {
    const createdTeam = await this.teamsService.create(createTeamDto);

    return CreateTeamResponse.ok(createdTeam);
  }

  @Get('')
  @ApiOperation({
    summary: '팀 목록 조회 API',
    description: 'offset based pagination 팀 목록 조회 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 200, description: 'The teams have been successfully retrieved.' })
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
    const { results: teams, totalCount } = await this.teamsService.getAll({
      skip: Number(skip),
      limit: Number(limit),
    });

    const players = await Promise.all(
      teams.map((team) => this.playersService.getAllByIds(team.players.map((player) => player.playerId.toString()))),
    );
    const countires = await Promise.all(teams.map((team) => this.countriesService.getById(team.countryId.toString())));
    const sportsCategories = await Promise.all(
      teams.map((team) => this.sportsCategoriesService.getById(team.sportsCategoryId.toString())),
    );

    return TeamsResponse.ok({
      result: teams.map((team, i) => ({
        ...team.toJSON(),
        players: players[i],
        country: countires[i],
        sportsCategory: sportsCategories[i],
      })),
      totalCount,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: '팀 단건 조회 API',
    description: '팀 단건 조회 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 200, description: 'The team has been successfully retrieved.' })
  async getById(@Param('id') id: string) {
    const team = await this.teamsService.getById(id);

    const country = await this.countriesService.getById(team.countryId.toString());
    const sportsCategory = this.sportsCategoriesService.getById(team.sportsCategoryId.toString());

    return TeamResponse.ok({
      ...team.toJSON(),
      country,
      sportsCategory,
    });
  }

  @Patch(':id')
  @ApiOperation({
    summary: '팀 수정 API',
    description: '팀 수정 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 200, description: 'The team has been successfully updated.' })
  @ApiExtraModels(UpdateTeamDto)
  async update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
    const updatedTeam = await this.teamsService.update(id, updateTeamDto);

    return UpdateTeamResponse.ok(updatedTeam);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '팀 삭제 API',
    description: '팀 삭제 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 200, description: 'The team has been successfully deleted.' })
  async softDelete(@Param('id') id: string) {
    const deletedTeam = await this.teamsService.softDelete(id);

    return TeamResponse.ok(deletedTeam);
  }
}
