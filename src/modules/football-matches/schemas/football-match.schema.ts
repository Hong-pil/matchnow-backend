// src/modules/football-matches/schemas/football-match.schema.ts (완전히 확장된 버전)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type FootballMatchDocument = HydratedDocument<FootballMatch>;

// 경기 통계 클래스 (매우 상세함)
@Schema({ _id: false })
export class MatchStats {
  // 공격 관련 통계
  @ApiProperty({ example: ['142', '85'] })
  @Prop({ type: [String], required: false })
  attacks?: [string, string];

  @ApiProperty({ example: ['63', '19'] })
  @Prop({ type: [String], required: false })
  dangerous_attacks?: [string, string];

  // 볼 점유 및 패스
  @ApiProperty({ example: ['50', '46'] })
  @Prop({ type: [String], required: false })
  ball_safe?: [string, string];

  @ApiProperty({ example: ['0.86', '0.57'] })
  @Prop({ type: [String], required: false })
  passing_accuracy?: [string, string];

  @ApiProperty({ example: ['10', '3'] })
  @Prop({ type: [String], required: false })
  key_passes?: [string, string];

  @ApiProperty({ example: ['20', '6'] })
  @Prop({ type: [String], required: false })
  crosses?: [string, string];

  @ApiProperty({ example: ['0.20', '0.17'] })
  @Prop({ type: [String], required: false })
  crossing_accuracy?: [string, string];

  // 점유율
  @ApiProperty({ example: ['71', '29'] })
  @Prop({ type: [String], required: false })
  possession_rt?: [string, string];

  // 슛 관련
  @ApiProperty({ example: ['9', '3'] })
  @Prop({ type: [String], required: false })
  goalattempts?: [string, string];

  @ApiProperty({ example: ['6', '1'] })
  @Prop({ type: [String], required: false })
  on_target?: [string, string];

  @ApiProperty({ example: ['8', '6'] })
  @Prop({ type: [String], required: false })
  off_target?: [string, string];

  @ApiProperty({ example: ['2', '0'] })
  @Prop({ type: [String], required: false })
  shots_blocked?: [string, string];

  @ApiProperty({ example: ['2', '4'] })
  @Prop({ type: [String], required: false })
  saves?: [string, string];

  // 골
  @ApiProperty({ example: ['2', '0'] })
  @Prop({ type: [String], required: false })
  goals?: [string, string];

  // xG (Expected Goals)
  @ApiProperty({ example: ['2.21', '0.32'] })
  @Prop({ type: [String], required: false })
  xg?: [string, string];

  // 코너킥
  @ApiProperty({ example: ['2', '2'] })
  @Prop({ type: [String], required: false })
  corners?: [string, string];

  @ApiProperty({ example: ['2', '2'] })
  @Prop({ type: [String], required: false })
  corner_f?: [string, string];

  @ApiProperty({ example: ['1', '1'] })
  @Prop({ type: [String], required: false })
  corner_h?: [string, string];

  // 카드
  @ApiProperty({ example: ['1', '1'] })
  @Prop({ type: [String], required: false })
  yellowcards?: [string, string];

  @ApiProperty({ example: ['0', '1'] })
  @Prop({ type: [String], required: false })
  redcards?: [string, string];

  @ApiProperty({ example: ['0', '0'] })
  @Prop({ type: [String], required: false })
  yellowred_cards?: [string, string];

  // 파울 및 오프사이드
  @ApiProperty({ example: ['4', '1'] })
  @Prop({ type: [String], required: false })
  fouls?: [string, string];

  @ApiProperty({ example: ['3', '1'] })
  @Prop({ type: [String], required: false })
  offsides?: [string, string];

  // 페널티
  @ApiProperty({ example: ['0', '0'] })
  @Prop({ type: [String], required: false })
  penalties?: [string, string];

  // 부상 및 교체
  @ApiProperty({ example: ['0', '5'] })
  @Prop({ type: [String], required: false })
  injuries?: [string, string];

  @ApiProperty({ example: ['5', '5'] })
  @Prop({ type: [String], required: false })
  substitutions?: [string, string];

  // 액션 에리어
  @ApiProperty({ example: ['23.60', '27.80'] })
  @Prop({ type: [String], required: false })
  action_areas?: [string, string];
}

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

  // 대체 팀 정보 (BetsAPI에서 제공)
  @ApiProperty({ type: MatchTeam })
  @Prop({ type: MatchTeam, required: false })
  o_home?: MatchTeam;

  @ApiProperty({ type: MatchTeam })
  @Prop({ type: MatchTeam, required: false })
  o_away?: MatchTeam;

  @ApiProperty({ example: '2-1' })
  @Prop({ type: String, required: false })
  ss?: string; // 스코어

  @ApiProperty({ type: MatchScores })
  @Prop({ type: MatchScores, required: false })
  scores?: MatchScores;

  @ApiProperty({ type: MatchTimer })
  @Prop({ type: MatchTimer, required: false })
  timer?: MatchTimer;

  // ⭐ 추가된 상세 통계
  @ApiProperty({ type: MatchStats })
  @Prop({ type: MatchStats, required: false })
  stats?: MatchStats;

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

  // 메타데이터
  @ApiProperty({ example: new Date() })
  @Prop({ type: Date, required: false })
  lastSyncAt?: Date; // 마지막 동기화 시간

  @ApiProperty({ example: 'betsapi' })
  @Prop({ type: String, required: false, default: 'betsapi' })
  dataSource?: string; // 데이터 출처

  @ApiProperty({ example: true })
  @Prop({ type: Boolean, required: false, default: true })
  allowSync?: boolean; // 동기화 허용 여부

  @ApiProperty({ example: new Date() })
  createdAt: Date;

  @ApiProperty({ example: new Date() })
  updatedAt: Date;

  @ApiProperty({ example: new Date() })
  @Prop({ type: Date, required: false })
  deletedAt?: Date;
}

export const FootballMatchSchema = SchemaFactory.createForClass(FootballMatch);