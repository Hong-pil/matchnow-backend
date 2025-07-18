import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { League, LeagueSchema } from './schemas/league.schema';
import { LeaguesController } from './controllers/leagues.controller';
import { LeaguesService } from './services/leagues.service';
import { LeaguesMongodbRepository } from './repositories/leagues.mongodb.repository';
import { CountriesModule } from '../countries/countries.module';
import { SportsCategoriesModule } from '../sports-categories/sports-categories.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: League.name, schema: LeagueSchema }]),
    CountriesModule,
    SportsCategoriesModule,
  ],
  providers: [LeaguesMongodbRepository, LeaguesService],
  controllers: [LeaguesController],
  exports: [LeaguesService],
})
export class LeaguesModule {}
