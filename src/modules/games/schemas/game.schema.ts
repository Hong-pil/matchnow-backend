import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, ObjectId } from 'mongoose';

import { GameTeamLocation, GameScoreStatus } from '../constants/game.constant';

export type GameDocument = HydratedDocument<Game>;

@Schema({ _id: false })
export class GameTeam {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Team' })
  teamId: ObjectId;

  @Prop({ type: String, required: false, enum: [GameTeamLocation.HOME, GameTeamLocation.AWAY] })
  location?: GameTeamLocation;
}

@Schema({ _id: false })
export class GameScore {
  @Prop({ type: Number, required: true })
  homeScore: number;

  @Prop({ type: Number, required: true })
  awayScore: number;

  @Prop({
    type: String,
    required: true,
    enum: [
      GameScoreStatus.SCHEDULED,
      GameScoreStatus.FIRST_HALF,
      GameScoreStatus.SECOND_HALF,
      GameScoreStatus.HALF,
      GameScoreStatus.FIRST_OVERTIME,
      GameScoreStatus.SECOND_OVERTIME,
    ],
  })
  status: GameScoreStatus;
}

@Schema({ collection: 'games', timestamps: true })
export class Game {
  @Prop({ type: Types.ObjectId, required: true, ref: 'SportsCategory' })
  sportsCategoryId: ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'League' })
  leagueId: ObjectId;

  @Prop({ type: [GameTeam], required: true })
  teams: GameTeam[];

  @Prop({ type: String, required: false })
  stadiumName?: string;

  @Prop({ type: String, required: false })
  status?: string;

  @Prop({ type: GameScore, required: false })
  score?: GameScore;

  @Prop({ type: Date, required: false })
  startedAt?: Date;

  @Prop({ type: Date, required: false })
  endedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const GameSchema = SchemaFactory.createForClass(Game);
