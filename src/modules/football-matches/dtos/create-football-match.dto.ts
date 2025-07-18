// src/modules/football-matches/dtos/create-football-match.dto.ts
import { PickType } from '@nestjs/swagger';
import { generateResponse } from '@/common/utils/response.util';
import { FootballMatch } from '../schemas/football-match.schema';

export class CreateFootballMatchDto extends PickType(FootballMatch, [
  'betsApiId',
  'sport_id',
  'time',
  'time_status',
  'league',
  'home',
  'away',
  'ss',
  'scores',
  'timer',
  'bet365_id',
  'round',
  'status',
  'adminNote',
] as const) {}

export class CreateFootballMatchResponse extends generateResponse(CreateFootballMatchDto) {}