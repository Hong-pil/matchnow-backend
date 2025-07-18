import { PickType, PartialType } from '@nestjs/swagger';

import { generateResponse } from '@/common/utils/response.util';

import { Team } from '../schemas/team.schema';

export class UpdateTeamDto extends PartialType(
  PickType(Team, [
    'name',
    'description',
    'countryId',
    'sportsCategoryId',
    'subSportCategory',
    'batsId',
    'groupId',
    'players',
    'logoUrl',
    'stadiumName',
  ] as const),
) {}
export class UpdateTeamResponse extends generateResponse(UpdateTeamDto) {}
