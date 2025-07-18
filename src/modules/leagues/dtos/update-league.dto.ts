import { PickType, PartialType } from '@nestjs/swagger';

import { generateResponse } from '@/common/utils/response.util';

import { League } from '../schemas/league.schema';

export class UpdateLeagueDto extends PartialType(
  PickType(League, [
    'name',
    'nameShort',
    'countryId',
    'sportsCategoryId',
    'subSportCategory',
    'batsId',
    'description',
    'logoUrl',
  ] as const),
) {}

export class UpdateLeagueResponse extends generateResponse(UpdateLeagueDto) {}
