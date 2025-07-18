import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ClsService } from 'nestjs-cls';

import { AppClsStore } from '@/common/types/cls.type';
import { ClsStoreKey } from '@/common/constants/cls.constant';
import { getDataLoader } from '@/common/utils/dataloader.util';

import { CreateSportsCategoryDto } from '../dtos/create-sports-category.dto';
import { SportsCategoriesMongodbRepository } from '../repositories/sports-categories.mongodb.repository';
import { UpdateSportsCategoryDto } from '../dtos/update-sports-category.dto';

@Injectable()
export class SportsCategoriesService {
  constructor(
    private readonly sportsCategoriesMongodbRepository: SportsCategoriesMongodbRepository,
    private readonly clsService: ClsService<AppClsStore>,
  ) {}

  async create(createBody: CreateSportsCategoryDto) {
    return this.sportsCategoriesMongodbRepository.create(createBody);
  }

  async getById(id: string) {
    const dataLoaders = this.clsService.get(ClsStoreKey.DATA_LOADERS);

    return getDataLoader(dataLoaders, this.sportsCategoriesMongodbRepository).load(id);
  }

  async getAll({ skip, limit }: { skip: number; limit: number }) {
    return this.sportsCategoriesMongodbRepository.findAll({
      filter: { $or: [{ deletedAt: null }] },
      skip,
      limit,
      sort: { createdAt: -1 },
      deletedFilter: true,
    });
  }

  async update(id: string, updateBody: UpdateSportsCategoryDto) {
    return this.sportsCategoriesMongodbRepository.updateById(new ObjectId(id), updateBody);
  }

  async softDelete(id: string) {
    return this.sportsCategoriesMongodbRepository.updateById(new ObjectId(id), { deletedAt: new Date() });
  }
}
