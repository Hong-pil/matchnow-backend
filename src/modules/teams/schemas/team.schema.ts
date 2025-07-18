import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

import { SubSportCategory } from '@/modules/leagues/constants/league.const';

export type TeamDocument = HydratedDocument<Team>;

@Schema({ _id: false })
export class TeamPlayer {
  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: 'Player',
    transform: (value: string) => new ObjectId(value),
  })
  playerId: ObjectId;
}

@Schema({ collection: 'teams', timestamps: true })
export class Team {
  @ApiProperty({ example: '토트넘' })
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ example: '프리미어리그 런던에 연고지를 둔 클럽팀' })
  @Prop({ type: String, required: false })
  description?: string;

  @ApiProperty({ example: '67fb44f1c0a1217c4055066a' })
  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: 'Country',
    transform: (value: string) => new ObjectId(value),
  })
  countryId: ObjectId;

  @ApiProperty({ example: '67fb29235ad090931b26cc40' })
  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: 'SportsCategory',
    transform: (value: string) => new ObjectId(value),
  })
  sportsCategoryId: ObjectId;

  @ApiProperty({ example: 'club', enum: [SubSportCategory.Club, SubSportCategory.National] })
  @Prop({ type: String, required: false, enum: [SubSportCategory.Club, SubSportCategory.National] })
  subSportCategory?: SubSportCategory;

  @ApiProperty({ example: '8910' })
  @Prop({ type: String, required: false })
  batsId?: string;

  @ApiProperty({ example: 'tottenham' })
  @Prop({ type: String, required: false })
  groupId?: string;

  @ApiProperty({ example: [{ playerId: '67fba5fe30fddbcd6af702ae' }] })
  @Prop({ type: [TeamPlayer], required: true })
  players: TeamPlayer[];

  @ApiProperty({ example: 'https://logoexample.com' })
  @Prop({ type: String, required: false })
  logoUrl?: string;

  @ApiProperty({ example: 'Tottenham Hotspur Stadium' })
  @Prop({ type: String, required: false })
  stadiumName?: string;

  @ApiProperty({ example: new Date() })
  createdAt: Date;
  @ApiProperty({ example: new Date() })
  updatedAt: Date;

  @ApiProperty({ example: new Date() })
  @Prop({ type: Date, required: false })
  deletedAt?: Date;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
