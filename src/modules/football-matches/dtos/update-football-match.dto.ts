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
    'ss',
    'scores',
    'timer',
    'bet365_id',
    'round',
    'status',
    'adminNote',
  ] as const)
) {}

export class UpdateFootballMatchResponse extends generateResponse(UpdateFootballMatchDto) {}