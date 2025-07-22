// src/modules/football-matches/dtos/update-football-match.dto.ts
import { PartialType, PickType } from '@nestjs/swagger';
import { generateResponse } from '@/common/utils/response.util';
import { FootballMatch } from '../schemas/football-match.schema';

export class UpdateFootballMatchDto extends PartialType(
  PickType(FootballMatch, [
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
  ] as const)
) {}

export class UpdateFootballMatchResponse extends generateResponse(UpdateFootballMatchDto) {}