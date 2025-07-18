import { generateResponse } from '@/common/utils/response.util';

import { Player } from '../schemas/player.schema';

export class PlayersResponse extends generateResponse([Player]) {}
export class PlayerResponse extends generateResponse(Player) {}
