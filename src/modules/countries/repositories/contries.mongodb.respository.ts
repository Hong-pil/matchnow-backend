import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CommonMongodbRepository } from '@/common/mongoose/common-mongodb.repository';

import { Country, CountryDocument } from '../schemas/country.schema';

@Injectable()
export class CountriesMongodbRepository extends CommonMongodbRepository<CountryDocument> {
  constructor(@InjectModel(Country.name) private readonly countriesModel: Model<CountryDocument>) {
    super(countriesModel);
  }
}
