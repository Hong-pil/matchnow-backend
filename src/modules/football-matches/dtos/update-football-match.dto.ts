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
    'o_home',      
    'o_away',      
    'ss',
    'scores',
    'timer',
    'stats',       
    'bet365_id',
    'round',
    'status',
    'adminNote',
    'lastSyncAt',  
    'dataSource',  
    'allowSync',   // 🆕 추가 - 동기화 허용 여부
  ] as const)
) {}

export class UpdateFootballMatchResponse extends generateResponse(UpdateFootballMatchDto) {}