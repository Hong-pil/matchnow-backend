import { PickType } from '@nestjs/swagger';

import { generateResponse } from '@/common/utils/response.util';

import { Team } from '../schemas/team.schema';

export class CreateTeamDto extends PickType(Team, [
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
] as const) {}
export class CreateTeamResponse extends generateResponse(CreateTeamDto) {}
