import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';
import { ObjectId } from 'mongodb';

export type LeagueSeasonDocument = HydratedDocument<LeagueSeason>;

@Schema({ _id: false })
export class LeagueSeasonRank {
  @ApiProperty({ example: 1 })
  @Prop({ type: Number, required: true })
  rank: number;

  @ApiProperty({ example: '680348cd52288c8bcc61d101' })
  @Prop({ type: Types.ObjectId, required: true })
  teamId: ObjectId;
}

@Schema({ collection: 'league-seasons', timestamps: true })
export class LeagueSeason {
  @ApiProperty({ example: '680d89660e5ed963351df51a' })
  @Prop({ type: Types.ObjectId, required: true, ref: 'League' })
  leagueId: ObjectId;

  @ApiProperty({ example: '22/23' })
  @Prop({ type: String, required: true })
  season: string;

  @ApiProperty({ type: [LeagueSeasonRank] })
  @Prop({ type: [LeagueSeasonRank], rank: true })
  ranks: LeagueSeasonRank[];

  @ApiProperty({ example: new Date() })
  createdAt: Date;
  @ApiProperty({ example: new Date() })
  updatedAt: Date;

  @ApiProperty({ example: new Date() })
  @Prop({ type: Date, required: false })
  deletedAt?: Date;
}

export const LeagueSeasonSchema = SchemaFactory.createForClass(LeagueSeason);
