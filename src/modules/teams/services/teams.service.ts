import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ClsService } from 'nestjs-cls';

import { AppClsStore } from '@/common/types/cls.type';
import { ClsStoreKey } from '@/common/constants/cls.constant';
import { getDataLoader } from '@/common/utils/dataloader.util';

import { TeamsMongodbRepository } from '../repositories/teams.mongodb.repository';
import { CreateTeamDto } from '../dtos/create-team.dto';
import { UpdateTeamDto } from '../dtos/update-team.dto';
import { TeamDocument } from '../schemas/team.schema';

@Injectable()
export class TeamsService {
  constructor(
    private readonly teamsMongodbRepository: TeamsMongodbRepository,
    private readonly clsService: ClsService<AppClsStore>,
  ) {}

  async create(createBody: CreateTeamDto) {
    return this.teamsMongodbRepository.create(createBody);
  }

  async getById(id: string): Promise<TeamDocument> {
    const dataLoaders = this.clsService.get(ClsStoreKey.DATA_LOADERS);

    return getDataLoader(dataLoaders, this.teamsMongodbRepository).load(id);
  }

  async getAll({ skip, limit }: { skip: number; limit: number }) {
    return this.teamsMongodbRepository.findAll({
      filter: { $or: [{ deletedAt: null }] },
      skip,
      limit,
      sort: { createdAt: -1 },
      deletedFilter: true,
    });
  }

  async update(id: string, updateBody: UpdateTeamDto) {
    return this.teamsMongodbRepository.updateById(new ObjectId(id), updateBody);
  }

  async softDelete(id: string) {
    return this.teamsMongodbRepository.updateById(new ObjectId(id), { deletedAt: new Date() });
  }
}
