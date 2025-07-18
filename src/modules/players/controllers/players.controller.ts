import { Body, Controller, Get, Post, Query, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiExtraModels, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { CreatePlayerDto, CreatePlayerResponse } from '../dtos/create-player.dto';
import { PlayersResponse, PlayerResponse } from '../dtos/players.dto';
import { UpdatePlayerDto, UpdatePlayerResponse } from '../dtos/update-player.dto';
import { PlayersService } from '../services/players.service';

@ApiTags('Players')
@Controller('/api/v1/players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post('')
  @ApiOperation({
    summary: '선수 생성 API',
    description: '선수 생성 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 201, description: 'The player has been successfully created.' })
  @ApiExtraModels(CreatePlayerDto)
  async create(@Body() createPlayerDto: CreatePlayerDto) {
    const createdPlayer = await this.playersService.create(createPlayerDto);

    return CreatePlayerResponse.ok(createdPlayer);
  }

  @Get('')
  @ApiOperation({
    summary: '선수 목록 조회 API',
    description: 'offset based pagination 선수 목록 조회 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 200, description: 'The players have been successfully retrieved.' })
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
    const players = await this.playersService.getAll({
      skip: Number(skip),
      limit: Number(limit),
    });

    return PlayersResponse.ok(players);
  }

  @Get(':id')
  @ApiOperation({
    summary: '선수 단건 조회 API',
    description: '선수 단건 조회 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 200, description: 'The player has been successfully retrieved.' })
  async getById(@Param('id') id: string) {
    const player = await this.playersService.getById(id);

    return PlayerResponse.ok(player);
  }

  @Patch(':id')
  @ApiOperation({
    summary: '선수 수정 API',
    description: '선수 수정 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 200, description: 'The player has been successfully updated.' })
  @ApiExtraModels(UpdatePlayerDto)
  async update(@Param('id') id: string, @Body() updatePlayerDto: UpdatePlayerDto) {
    const updatedPlayer = await this.playersService.update(id, updatePlayerDto);

    return UpdatePlayerResponse.ok(updatedPlayer);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '선수 삭제 API',
    description: '선수 삭제 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 200, description: 'The player has been successfully deleted.' })
  async softDelete(@Param('id') id: string) {
    const deletedPlayer = await this.playersService.softDelete(id);

    return PlayerResponse.ok(deletedPlayer);
  }
}
