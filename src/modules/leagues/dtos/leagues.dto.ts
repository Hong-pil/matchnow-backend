import { generateResponse } from '@/common/utils/response.util';

import { League } from '../schemas/league.schema';

export class LeaguesResponse extends generateResponse([League]) {}
export class LeagueResponse extends generateResponse(League) {}
