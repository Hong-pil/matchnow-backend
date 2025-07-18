import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ClsService } from 'nestjs-cls';

import { AppClsStore } from '@/common/types/cls.type';
import { ClsStoreKey } from '@/common/constants/cls.constant';
import { getDataLoader } from '@/common/utils/dataloader.util';

import { CountriesMongodbRepository } from '../repositories/contries.mongodb.respository';
import { CreateCountryDto } from '../dtos/create-country.dto';
import { UpdateCountryDto } from '../dtos/update-country.dto';

@Injectable()
export class CountriesService {
  constructor(
    private readonly countriesMongodbRepository: CountriesMongodbRepository,
    private readonly clsService: ClsService<AppClsStore>,
  ) {}

  async create(createBody: CreateCountryDto) {
    return this.countriesMongodbRepository.create(createBody);
  }

  async getById(id: string) {
    const dataLoaders = this.clsService.get(ClsStoreKey.DATA_LOADERS);

    return getDataLoader(dataLoaders, this.countriesMongodbRepository).load(id);
  }

  async getAll({ skip, limit }: { skip: number; limit: number }) {
    return this.countriesMongodbRepository.findAll({
      filter: { $or: [{ deletedAt: null }] },
      skip,
      limit,
      sort: { createdAt: -1 },
      deletedFilter: true,
    });
  }

  async update(id: string, updateBody: UpdateCountryDto) {
    return this.countriesMongodbRepository.updateById(new ObjectId(id), updateBody);
  }

  async softDelete(id: string) {
    return this.countriesMongodbRepository.updateById(new ObjectId(id), { deletedAt: new Date() });
  }
}
