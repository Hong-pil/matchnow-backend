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
  'o_home',      // 🆕 추가
  'o_away',      // 🆕 추가
  'ss',
  'scores',
  'timer',
  'stats',       // 🆕 추가
  'bet365_id',
  'round',
  'status',
  'adminNote',
  'lastSyncAt',  // 🆕 추가
  'dataSource',  // 🆕 추가
] as const) {}

export class CreateFootballMatchResponse extends generateResponse(CreateFootballMatchDto) {}