import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Player, PlayerSchema } from './schemas/player.schema';
import { PlayersController } from './controllers/players.controller';
import { PlayersService } from './services/players.service';
import { PlayersMongodbRepository } from './repositories/players.mongodb.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }])],
  providers: [PlayersMongodbRepository, PlayersService],
  controllers: [PlayersController],
  exports: [PlayersService],
})
export class PlayersModule {}
