import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CommonMongodbRepository } from '@/common/mongoose/common-mongodb.repository';

import { LeagueSeason, LeagueSeasonDocument } from '../schemas/league-season.schema';

@Injectable()
export class LeagueSeasonsMongodbRepository extends CommonMongodbRepository<LeagueSeasonDocument> {
  constructor(@InjectModel(LeagueSeason.name) private readonly leagueSeasonsModel: Model<LeagueSeasonDocument>) {
    super(leagueSeasonsModel);
  }
}
