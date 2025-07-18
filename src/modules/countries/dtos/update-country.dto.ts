import { PickType, PartialType } from '@nestjs/swagger';

import { generateResponse } from '@/common/utils/response.util';

import { Country } from '../schemas/country.schema';
export class UpdateCountryDto extends PartialType(PickType(Country, ['name'] as const)) {}
export class UpdateCountryResponse extends generateResponse(UpdateCountryDto) {}
