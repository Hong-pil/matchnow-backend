import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CommonMongodbRepository } from '@/common/mongoose/common-mongodb.repository';

import { SportsCategory, SportsCategoryDocument } from '../schemas/sports-category.schema';

@Injectable()
export class SportsCategoriesMongodbRepository extends CommonMongodbRepository<SportsCategoryDocument> {
  constructor(@InjectModel(SportsCategory.name) private readonly sportsCategoriesModel: Model<SportsCategoryDocument>) {
    super(sportsCategoriesModel);
  }
}
