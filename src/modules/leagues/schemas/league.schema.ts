import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';
import { ObjectId } from 'mongodb';

import { SubSportCategory } from '../constants/league.const';

export type LeagueDocument = HydratedDocument<League>;

@Schema({ collection: 'leagues', timestamps: true })
export class League {
  @ApiProperty({ example: '잉글랜드 프리미어 리그' })
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ example: 'EPL' })
  @Prop({ type: String, required: false })
  nameShort: string;

  @ApiProperty({ example: '68034ab6484e647264f2054a' })
  @Prop({ type: Types.ObjectId, required: true, ref: 'Country' })
  countryId: ObjectId;

  @ApiProperty({ example: '67fb673fb3fed472328d3179' })
  @Prop({ type: Types.ObjectId, required: true, ref: 'SportsCategory' })
  sportsCategoryId: ObjectId;

  @ApiProperty({ example: SubSportCategory.Club, enum: [SubSportCategory.Club, SubSportCategory.National] })
  @Prop({ type: String, required: false, enum: [SubSportCategory.Club, SubSportCategory.National] })
  subSportCategory?: SubSportCategory;

  @ApiProperty({ example: '94' })
  @Prop({ type: String, required: true })
  batsId: string;

  @ApiProperty({ example: '프리미어 리그' })
  @Prop({ type: String, required: true })
  description: string;

  @ApiProperty({ example: 'https://logoexample.com' })
  @Prop({ type: String, required: false })
  logoUrl?: string;

  @ApiProperty({ example: new Date() })
  createdAt: Date;
  @ApiProperty({ example: new Date() })
  updatedAt: Date;

  @ApiProperty({ example: new Date() })
  @Prop({ type: Date, required: false })
  deletedAt?: Date;
}

export const LeagueSchema = SchemaFactory.createForClass(League);
