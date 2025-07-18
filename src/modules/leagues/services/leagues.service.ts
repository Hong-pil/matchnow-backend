import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ClsService } from 'nestjs-cls';

import { AppClsStore } from '@/common/types/cls.type';
import { ClsStoreKey } from '@/common/constants/cls.constant';
import { getDataLoader } from '@/common/utils/dataloader.util';

import { LeaguesMongodbRepository } from '../repositories/leagues.mongodb.repository';
import { CreateLeagueDto } from '../dtos/create-league.dto';
import { UpdateLeagueDto } from '../dtos/update-league.dto';
import { LeagueDocument } from '../schemas/league.schema';

@Injectable()
export class LeaguesService {
  constructor(
    private readonly leaguesMongodbRepository: LeaguesMongodbRepository,
    private readonly clsService: ClsService<AppClsStore>,
  ) {}

  async create(createBody: CreateLeagueDto) {
    return this.leaguesMongodbRepository.create(createBody);
  }

  async getById(id: string): Promise<LeagueDocument> {
    const dataLoaders = this.clsService.get(ClsStoreKey.DATA_LOADERS);

    return getDataLoader(dataLoaders, this.leaguesMongodbRepository).load(id);
  }

  async getAll({ skip, limit }: { skip: number; limit: number }) {
    return this.leaguesMongodbRepository.findAll({
      filter: { $or: [{ deletedAt: null }] },
      skip,
      limit,
      sort: { createdAt: -1 },
      deletedFilter: true,
    });
  }

  async update(id: string, updateBody: UpdateLeagueDto) {
    return this.leaguesMongodbRepository.updateById(new ObjectId(id), updateBody);
  }

  async softDelete(id: string) {
    return this.leaguesMongodbRepository.updateById(new ObjectId(id), { deletedAt: new Date() });
  }
}
