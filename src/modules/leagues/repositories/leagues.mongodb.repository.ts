import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CommonMongodbRepository } from '@/common/mongoose/common-mongodb.repository';

import { League, LeagueDocument } from '../schemas/league.schema';

@Injectable()
export class LeaguesMongodbRepository extends CommonMongodbRepository<LeagueDocument> {
  constructor(@InjectModel(League.name) private readonly leaguesModel: Model<LeagueDocument>) {
    super(leaguesModel);
  }
}
