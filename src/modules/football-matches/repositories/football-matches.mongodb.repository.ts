// src/modules/football-matches/repositories/football-matches.mongodb.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommonMongodbRepository } from '@/common/mongoose/common-mongodb.repository';
import { FootballMatch, FootballMatchDocument } from '../schemas/football-match.schema';

@Injectable()
export class FootballMatchesMongodbRepository extends CommonMongodbRepository<FootballMatchDocument> {
  constructor(
    @InjectModel(FootballMatch.name) 
    private readonly footballMatchesModel: Model<FootballMatchDocument>
  ) {
    super(footballMatchesModel);
  }

  async findByBetsApiId(betsApiId: string): Promise<FootballMatchDocument | null> {
    return this.footballMatchesModel.findOne({ betsApiId, deletedAt: null }).exec();
  }

  async findByTimeStatus(timeStatus: string, limit?: number): Promise<FootballMatchDocument[]> {
    const query = this.footballMatchesModel.find({ 
      time_status: timeStatus, 
      deletedAt: null,
      status: 'active'
    }).sort({ time: 1 });
    
    if (limit) {
      query.limit(limit);
    }
    
    return query.exec();
  }

  async findByDateRange(startDate: string, endDate: string): Promise<FootballMatchDocument[]> {
    return this.footballMatchesModel.find({
      time: {
        $gte: startDate,
        $lte: endDate
      },
      deletedAt: null,
      status: 'active'
    }).sort({ time: 1 }).exec();
  }

  // hardDelete를 위한 메서드 추가 (private model 접근 대신)
  async hardDeleteById(id: string): Promise<void> {
    await this.footballMatchesModel.findByIdAndDelete(id).exec();
  }
}