// src/modules/football-matches/schemas/football-match.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type FootballMatchDocument = HydratedDocument<FootballMatch>;

@Schema({ _id: false })
export class MatchTeam {
  @ApiProperty({ example: '83068' })
  @Prop({ type: String, required: true })
  id: string;

  @ApiProperty({ example: 'Al Zawra\'a' })
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ example: '35888' })
  @Prop({ type: String, required: false })
  image_id?: string;

  @ApiProperty({ example: 'IQ' })
  @Prop({ type: String, required: false })
  cc?: string;
}

@Schema({ _id: false })
export class MatchLeague {
  @ApiProperty({ example: '39521' })
  @Prop({ type: String, required: true })
  id: string;

  @ApiProperty({ example: 'Iraq Stars League' })
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ example: 'IQ' })
  @Prop({ type: String, required: false })
  cc?: string;
}

@Schema({ _id: false })
export class MatchTimer {
  @ApiProperty({ example: 93 })
  @Prop({ type: Number, required: false })
  tm?: number;

  @ApiProperty({ example: 37 })
  @Prop({ type: Number, required: false })
  ts?: number;

  @ApiProperty({ example: '1' })
  @Prop({ type: String, required: false })
  tt?: string;

  @ApiProperty({ example: 0 })
  @Prop({ type: Number, required: false })
  ta?: number;

  @ApiProperty({ example: 1 })
  @Prop({ type: Number, required: false })
  md?: number;
}

@Schema({ _id: false })
export class MatchScores {
  @ApiProperty({ example: { home: '1', away: '0' } })
  @Prop({ type: Object, required: false })
  "1"?: { home: string; away: string };

  @ApiProperty({ example: { home: '1', away: '1' } })
  @Prop({ type: Object, required: false })
  "2"?: { home: string; away: string };
}

@Schema({ collection: 'football-matches', timestamps: true })
export class FootballMatch {
  @ApiProperty({ example: '10150692' })
  @Prop({ type: String, required: true, unique: true })
  betsApiId: string; // BetsAPI에서 가져온 원본 ID

  @ApiProperty({ example: '1' })
  @Prop({ type: String, required: true })
  sport_id: string;

  @ApiProperty({ example: '1750865400' })
  @Prop({ type: String, required: true })
  time: string;

  @ApiProperty({ example: '0' })
  @Prop({ type: String, required: true })
  time_status: string; // 0: 예정, 1: 진행중, 3: 종료

  @ApiProperty({ type: MatchLeague })
  @Prop({ type: MatchLeague, required: true })
  league: MatchLeague;

  @ApiProperty({ type: MatchTeam })
  @Prop({ type: MatchTeam, required: true })
  home: MatchTeam;

  @ApiProperty({ type: MatchTeam })
  @Prop({ type: MatchTeam, required: true })
  away: MatchTeam;

  @ApiProperty({ example: '2-1' })
  @Prop({ type: String, required: false })
  ss?: string; // 스코어

  @ApiProperty({ type: MatchScores })
  @Prop({ type: MatchScores, required: false })
  scores?: MatchScores;

  @ApiProperty({ type: MatchTimer })
  @Prop({ type: MatchTimer, required: false })
  timer?: MatchTimer;

  @ApiProperty({ example: '176851311' })
  @Prop({ type: String, required: false })
  bet365_id?: string;

  @ApiProperty({ example: '14' })
  @Prop({ type: String, required: false })
  round?: string;

  @ApiProperty({ example: 'active' })
  @Prop({ type: String, required: false, default: 'active' })
  status?: string; // active, inactive, deleted

  @ApiProperty({ example: '관리자가 수정한 경기' })
  @Prop({ type: String, required: false })
  adminNote?: string; // 관리자 노트

  @ApiProperty({ example: new Date() })
  createdAt: Date;

  @ApiProperty({ example: new Date() })
  updatedAt: Date;

  @ApiProperty({ example: new Date() })
  @Prop({ type: Date, required: false })
  deletedAt?: Date;
}

export const FootballMatchSchema = SchemaFactory.createForClass(FootballMatch);