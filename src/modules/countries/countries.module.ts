import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Country, CountrySchema } from './schemas/country.schema';
import { CountriesController } from './controllers/countries.controller';
import { CountriesService } from './services/countries.service';
import { CountriesMongodbRepository } from './repositories/contries.mongodb.respository';

@Module({
  imports: [MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }])],
  providers: [CountriesMongodbRepository, CountriesService],
  controllers: [CountriesController],
  exports: [CountriesService],
})
export class CountriesModule {}
