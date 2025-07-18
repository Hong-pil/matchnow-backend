import { Body, Controller, Get, Post, Query, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiExtraModels, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { CreateCountryDto, CreateCountryResponse } from '../dtos/create-country.dto';
import { CountriesResponse, CountryResponse } from '../dtos/countries.dto';
import { UpdateCountryDto, UpdateCountryResponse } from '../dtos/update-country.dto';
import { CountriesService } from '../services/countries.service';

@ApiTags('Countries')
@Controller('/api/v1/countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Post('')
  @ApiOperation({
    summary: '국가 생성 API',
    description: '국가 생성 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 201, description: 'The country has been successfully created.' })
  @ApiExtraModels(CreateCountryDto)
  async create(@Body() createCountryDto: CreateCountryDto) {
    const createdCountry = await this.countriesService.create(createCountryDto);

    return CreateCountryResponse.ok(createdCountry);
  }

  @Get('')
  @ApiOperation({
    summary: '국가 목록 조회 API',
    description: 'offset based pagination 국가 목록 조회 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 200, description: 'The countries have been successfully retrieved.' })
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
    const countries = await this.countriesService.getAll({
      skip: Number(skip),
      limit: Number(limit),
    });

    return CountriesResponse.ok(countries);
  }

  @Get(':id')
  @ApiOperation({
    summary: '국가 단건 조회 API',
    description: '국가 단건 조회 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 200, description: 'The country have been successfully retrieved.' })
  async get(@Param('id') id: string) {
    const country = await this.countriesService.getById(id);

    return CountryResponse.ok(country);
  }

  @Patch(':id')
  @ApiOperation({
    summary: '국가 수정 API',
    description: '국가 수정 (validation 기능 적용 전)',
  })
  @ApiExtraModels(UpdateCountryDto)
  async update(@Param('id') id: string, @Body() updateCountryDto: UpdateCountryDto) {
    const updatedCountry = await this.countriesService.update(id, updateCountryDto);

    return UpdateCountryResponse.ok(updatedCountry);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '국가 삭제 API',
    description: '국가 삭제 (validation 기능 적용 전)',
  })
  @ApiResponse({ status: 200, description: 'The country has been successfully deleted.' })
  async softDelete(@Param('id') id: string) {
    const deletedCountry = await this.countriesService.softDelete(id);

    return CountryResponse.ok(deletedCountry);
  }
}
