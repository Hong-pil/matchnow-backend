import { PickType } from '@nestjs/swagger';

import { generateResponse } from '@/common/utils/response.util';

import { SportsCategory } from '../schemas/sports-category.schema';

export class CreateSportsCategoryDto extends PickType(SportsCategory, ['name', 'nameEn'] as const) {}
export class CreateSportsCategoryResponse extends generateResponse(CreateSportsCategoryDto) {}
