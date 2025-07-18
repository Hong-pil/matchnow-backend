import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ClsService } from 'nestjs-cls';

import { AppClsStore } from '@/common/types/cls.type';
import { ClsStoreKey } from '@/common/constants/cls.constant';
import { getDataLoader } from '@/common/utils/dataloader.util';

import { PlayersMongodbRepository } from '../repositories/players.mongodb.repository';
import { CreatePlayerDto } from '../dtos/create-player.dto';
import { UpdatePlayerDto } from '../dtos/update-player.dto';

@Injectable()
export class PlayersService {
  constructor(
    private readonly playersMongodbRepository: PlayersMongodbRepository,
    private readonly clsService: ClsService<AppClsStore>,
  ) {}

  async create(createBody: CreatePlayerDto) {
    return this.playersMongodbRepository.create(createBody);
  }

  async getById(id: string) {
    const dataLoaders = this.clsService.get(ClsStoreKey.DATA_LOADERS);

    return getDataLoader(dataLoaders, this.playersMongodbRepository).load(id);
  }

  async getAllByIds(ids: string[]) {
    const dataLoaders = this.clsService.get(ClsStoreKey.DATA_LOADERS);

    return getDataLoader(dataLoaders, this.playersMongodbRepository).loadMany(ids);
  }

  async getAll({ skip, limit }: { skip: number; limit: number }) {
    return this.playersMongodbRepository.findAll({
      filter: { $or: [{ deletedAt: null }] },
      skip,
      limit,
      sort: { createdAt: -1 },
      deletedFilter: true,
    });
  }

  async update(id: string, updateBody: UpdatePlayerDto) {
    return this.playersMongodbRepository.updateById(new ObjectId(id), updateBody);
  }

  async softDelete(id: string) {
    return this.playersMongodbRepository.updateById(new ObjectId(id), { deletedAt: new Date() });
  }
}
