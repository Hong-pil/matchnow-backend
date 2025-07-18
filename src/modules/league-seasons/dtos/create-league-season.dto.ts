import { PickType } from '@nestjs/swagger';

import { generateResponse } from '@/common/utils/response.util';

import { LeagueSeason } from '../schemas/league-season.schema';

export class CreateLeagueSeasonDto extends PickType(LeagueSeason, ['leagueId', 'season', 'ranks'] as const) {}

export class CreateLeagueSeasonResponse extends generateResponse(CreateLeagueSeasonDto) {}
