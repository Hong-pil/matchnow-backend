import { PickType } from '@nestjs/swagger';

import { generateResponse } from '@/common/utils/response.util';

import { League } from '../schemas/league.schema';

export class CreateLeagueDto extends PickType(League, [
  'name',
  'nameShort',
  'countryId',
  'sportsCategoryId',
  'subSportCategory',
  'batsId',
  'description',
  'logoUrl',
] as const) {}

export class CreateLeagueResponse extends generateResponse(CreateLeagueDto) {}
