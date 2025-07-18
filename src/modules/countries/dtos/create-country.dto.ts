import { PickType } from '@nestjs/swagger';

import { generateResponse } from '@/common/utils/response.util';

import { Country } from '../schemas/country.schema';

export class CreateCountryDto extends PickType(Country, ['name'] as const) {}
export class CreateCountryResponse extends generateResponse(CreateCountryDto) {}
