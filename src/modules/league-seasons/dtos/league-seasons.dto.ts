import { generateResponse } from '@/common/utils/response.util';

import { LeagueSeason } from '../schemas/league-season.schema';

export class LeagueSeasonsResponse extends generateResponse([LeagueSeason]) {}
export class LeagueSeasonResponse extends generateResponse(LeagueSeason) {}
