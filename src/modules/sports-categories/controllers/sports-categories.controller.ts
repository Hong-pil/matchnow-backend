import { Body, Controller, Get, Post, Query, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiExtraModels, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { CreateSportsCategoryDto, CreateSportsCategoryResponse } from '../dtos/create-sports-category.dto';
import { SportsCategoriesResponse, SportsCategoryResponse } from '../dtos/sports-categories.dto';
import { UpdateSportsCategoryDto, UpdateSportsCategoryResponse } from '../dtos/update-sports-category.dto';
import { SportsCategoriesService } from '../services/sports-categories.service';

@ApiTags('Sports Categories')
@Controller('/api/v1/sports-categories')
export class SportsCategoriesController {
  constructor(private readonly sportsCategoriesService: SportsCategoriesService) {}

  @Post('')
  @ApiOperation({
    summary: '스포츠 카테고리 생성 API',
    description: '축구, 야구 등 큰 단위의 스포츠 카테고리 생성 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 201, description: 'The sports category has been successfully created.' })
  @ApiExtraModels(CreateSportsCategoryDto)
  async create(@Body() createSportsCategoryDto: CreateSportsCategoryDto) {
    const createdSportsCategory = await this.sportsCategoriesService.create(createSportsCategoryDto);

    return CreateSportsCategoryResponse.ok(createdSportsCategory);
  }

  @Get('')
  @ApiOperation({
    summary: '스포츠 카테고리 목록 조회 API',
    description: 'offset based pagination 스포츠 카테고리 목록 조회 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 200, description: 'The sports categories have been successfully retrieved.' })
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
    const sportsCategories = await this.sportsCategoriesService.getAll({
      skip: Number(skip),
      limit: Number(limit),
    });

    return SportsCategoriesResponse.ok(sportsCategories);
  }

  @Get(':id')
  @ApiOperation({
    summary: '스포츠 카테고리 단건 조회 API',
    description: '스포츠 카테고리 단건 조회 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 200, description: 'The sports category have been successfully retrieved.' })
  async get(@Param('id') id: string) {
    const sportsCategory = await this.sportsCategoriesService.getById(id);

    return SportsCategoryResponse.ok(sportsCategory);
  }

  @Patch(':id')
  @ApiOperation({
    summary: '스포츠 카테고리 수정 API',
    description: '스포츠 카테고리 수정 (validation 기능 적용 전)',
  })
  @ApiExtraModels(UpdateSportsCategoryDto)
  @ApiResponse({ status: 200, description: 'The sports category has been successfully updated.' })
  async update(@Param('id') id: string, @Body() updateSportsCategoryDto: UpdateSportsCategoryDto) {
    const updatedSportsCategory = await this.sportsCategoriesService.update(id, updateSportsCategoryDto);

    return UpdateSportsCategoryResponse.ok(updatedSportsCategory);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '스포츠 카테고리 삭제 API',
    description: '스포츠 카테고리 삭제 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 200, description: 'The sports category has been successfully deleted.' })
  async delete(@Param('id') id: string) {
    const deletedSportsCategory = await this.sportsCategoriesService.softDelete(id);

    return SportsCategoryResponse.ok(deletedSportsCategory);
  }
}
