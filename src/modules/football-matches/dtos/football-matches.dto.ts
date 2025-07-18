// src/modules/football-matches/dtos/football-matches.dto.ts
import { generateResponse } from '@/common/utils/response.util';
import { FootballMatch } from '../schemas/football-match.schema';

export class FootballMatchesResponse extends generateResponse([FootballMatch]) {}
export class FootballMatchResponse extends generateResponse(FootballMatch) {}