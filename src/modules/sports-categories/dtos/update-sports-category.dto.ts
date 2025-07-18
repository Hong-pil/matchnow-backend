import { PickType, PartialType } from '@nestjs/swagger';

import { generateResponse } from '@/common/utils/response.util';

import { SportsCategory } from '../schemas/sports-category.schema';

export class UpdateSportsCategoryDto extends PartialType(PickType(SportsCategory, ['name', 'nameEn'] as const)) {}
export class UpdateSportsCategoryResponse extends generateResponse(UpdateSportsCategoryDto) {}
