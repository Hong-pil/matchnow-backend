// src/modules/football-matches/types/football-match.types.ts
export interface MergedMatch {
  id: string;
  sport_id: string;
  time: string;
  time_status: string;
  league: {
    id: string;
    name: string;
    cc?: string;
  };
  home: {
    id: string;
    name: string;
    image_id?: string;
    cc?: string;
  };
  away: {
    id: string;
    name: string;
    image_id?: string;
    cc?: string;
  };
  // 🆕 대체 팀 정보 추가
  o_home?: {
    id: string;
    name: string;
    image_id?: string;
    cc?: string;
  };
  o_away?: {
    id: string;
    name: string;
    image_id?: string;
    cc?: string;
  };
  ss?: string;
  scores?: {
    "1"?: { home: string; away: string };
    "2"?: { home: string; away: string };
  };
  timer?: {
    tm?: number;
    ts?: number;
    tt?: string;
    ta?: number;
    md?: number;
  };
  // 🆕 상세 통계 추가
  stats?: {
    attacks?: [string, string];
    dangerous_attacks?: [string, string];
    ball_safe?: [string, string];
    passing_accuracy?: [string, string];
    key_passes?: [string, string];
    crosses?: [string, string];
    crossing_accuracy?: [string, string];
    possession_rt?: [string, string];
    goalattempts?: [string, string];
    on_target?: [string, string];
    off_target?: [string, string];
    shots_blocked?: [string, string];
    saves?: [string, string];
    goals?: [string, string];
    xg?: [string, string];
    corners?: [string, string];
    corner_f?: [string, string];
    corner_h?: [string, string];
    yellowcards?: [string, string];
    redcards?: [string, string];
    yellowred_cards?: [string, string];
    fouls?: [string, string];
    offsides?: [string, string];
    penalties?: [string, string];
    injuries?: [string, string];
    substitutions?: [string, string];
    action_areas?: [string, string];
  };
  bet365_id?: string;
  round?: string;
  _id?: string;
  adminNote?: string;
  isModified: boolean;
  isLocalOnly?: boolean;
  localData?: any;
  // 🆕 추가 메타데이터
  fullStats?: any;
  dataSource?: string;
  lastSyncAt?: Date;
}

export interface EnhancedMatchResponse {
  results: MergedMatch[];
  pager?: {
    page: number;
    per_page: number;
    total: number;
  };
  enhanced: boolean;
  stats?: {
    total_matches: number;
    modified_matches: number;
    local_only_matches: number;
  };
}