import { PickType, PartialType } from '@nestjs/swagger';

import { generateResponse } from '@/common/utils/response.util';

import { LeagueSeason } from '../schemas/league-season.schema';

export class UpdateLeagueSeasonDto extends PartialType(
  PickType(LeagueSeason, ['leagueId', 'season', 'ranks'] as const),
) {}

export class UpdateLeagueSeasonResponse extends generateResponse(UpdateLeagueSeasonDto) {}
