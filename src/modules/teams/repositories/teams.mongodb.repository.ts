import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CommonMongodbRepository } from '@/common/mongoose/common-mongodb.repository';

import { Team, TeamDocument } from '../schemas/team.schema';

@Injectable()
export class TeamsMongodbRepository extends CommonMongodbRepository<TeamDocument> {
  constructor(@InjectModel(Team.name) private readonly teamsModel: Model<TeamDocument>) {
    super(teamsModel);
  }
}
