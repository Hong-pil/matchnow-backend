import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CommonMongodbRepository } from '@/common/mongoose/common-mongodb.repository';

import { Player, PlayerDocument } from '../schemas/player.schema';

@Injectable()
export class PlayersMongodbRepository extends CommonMongodbRepository<PlayerDocument> {
  constructor(@InjectModel(Player.name) private readonly playersModel: Model<PlayerDocument>) {
    super(playersModel);
  }
}
