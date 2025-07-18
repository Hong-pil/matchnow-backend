import { generateResponse } from '@/common/utils/response.util';

import { Team } from '../schemas/team.schema';

export class TeamsResponse extends generateResponse([Team]) {}
export class TeamResponse extends generateResponse(Team) {}
