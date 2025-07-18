import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Team, TeamSchema } from './schemas/team.schema';
import { TeamsController } from './controllers/teams.controller';
import { TeamsService } from './services/teams.service';
import { TeamsMongodbRepository } from './repositories/teams.mongodb.repository';
import { PlayersModule } from '../players/players.module';
import { CountriesModule } from '../countries/countries.module';
import { SportsCategoriesModule } from '../sports-categories/sports-categories.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Team.name, schema: TeamSchema }]),
    PlayersModule,
    CountriesModule,
    SportsCategoriesModule,
  ],
  providers: [TeamsMongodbRepository, TeamsService],
  controllers: [TeamsController],
  exports: [TeamsService],
})
export class TeamsModule {}
