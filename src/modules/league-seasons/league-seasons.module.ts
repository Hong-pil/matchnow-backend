import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LeaguesModule } from '@/modules/leagues/leagues.module';
import { TeamsModule } from '@/modules/teams/teams.module';

import { LeagueSeason, LeagueSeasonSchema } from './schemas/league-season.schema';
import { LeagueSeasonsMongodbRepository } from './repositories/league-seasons.mongodb.repository';
import { LeagueSeasonsService } from './services/league-seasons.service';
import { LeagueSeasonsController } from './controllers/league-seasons.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LeagueSeason.name, schema: LeagueSeasonSchema }]),
    LeaguesModule,
    TeamsModule,
  ],
  providers: [LeagueSeasonsMongodbRepository, LeagueSeasonsService],
  controllers: [LeagueSeasonsController],
})
export class LeagueSeasonsModule {}
