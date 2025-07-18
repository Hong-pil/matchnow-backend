// src/modules/football-matches/football-matches.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FootballMatch, FootballMatchSchema } from './schemas/football-match.schema';
import { FootballMatchesController } from './controllers/football-matches.controller';
import { FootballMatchesService } from './services/football-matches.service';
import { FootballMatchesMongodbRepository } from './repositories/football-matches.mongodb.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FootballMatch.name, schema: FootballMatchSchema }
    ]),
  ],
  providers: [
    FootballMatchesMongodbRepository,
    FootballMatchesService,
  ],
  controllers: [FootballMatchesController],
  exports: [FootballMatchesService],
})
export class FootballMatchesModule {}