import { PickType } from '@nestjs/swagger';

import { generateResponse } from '@/common/utils/response.util';

import { Player } from '../schemas/player.schema';

export class CreatePlayerDto extends PickType(Player, [
  'name',
  'nameEn',
  'position',
  'healthStatus',
  'photos',
] as const) {}
export class CreatePlayerResponse extends generateResponse(CreatePlayerDto) {}
