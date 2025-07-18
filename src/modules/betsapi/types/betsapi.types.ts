// src/modules/betsapi/types/betsapi.types.ts

// ============================================
// 공통 응답 구조
// ============================================
export interface BetsApiResponse<T = any> {
  success: number;           // 1 = 성공
  pager?: {
    page: number;           // 현재 페이지
    per_page: number;       // 페이지당 항목 수
    total: number;          // 전체 항목 수
  };
  results: T[];
}

// ============================================
// 경기 상태 열거형
// ============================================
export enum MatchTimeStatus {
  SCHEDULED = '0',          // 예정됨 (upcoming)
  IN_PLAY = '1',           // 진행 중 (inplay)
  HALFTIME = '2',          // 하프타임
  FINISHED = '3',          // 종료됨 (ended)
  POSTPONED = '4',         // 연기됨 (ended)
  CANCELLED = '5',         // 취소됨 (ended)
}

// ============================================
// 공통 팀 인터페이스
// ============================================
export interface BetsApiTeam {
  id: string;               // "83068"
  name: string;             // "Al Zawra'a"
  image_id: string | null;  // "35888" 또는 null
  cc: string | null;        // 국가 코드 또는 null
}

// ============================================
// 리그 인터페이스
// ============================================
export interface BetsApiLeague {
  id: string;               // "39521"
  name: string;             // "Iraq Stars League"
  cc: string | null;        // 국가 코드 또는 null
}

// ============================================
// 경기 타이머 인터페이스
// ============================================
export interface BetsApiTimer {
  tm: number;               // 경기 시간 (분) 93
  ts: number;               // 경기 시간 (초) 37
  tt: string;               // 타이머 타입 "1"
  ta: number;               // 추가 시간 0
  md: number;               // 매치 데이 1
}

// ============================================
// 세트별 스코어 인터페이스
// ============================================
export interface BetsApiScores {
  "1"?: { home: string; away: string; };  // 1세트 (전반전)
  "2"?: { home: string; away: string; };  // 2세트 (후반전)
}

// ============================================
// 경기 통계 인터페이스
// ============================================
export interface BetsApiMatchStats {
  // 기본 통계 (홈팀, 원정팀 순서의 배열)
  attacks?: [string, string];           // ["70", "57"]
  ball_safe?: [string, string];         // ["52", "54"]
  corners?: [string, string];           // ["3", "3"]
  corner_h?: [string, string];          // ["2", "0"] - 하프타임 코너킥
  corner_f?: [string, string];          // ["4", "2"] - 풀타임 코너킥
  dangerous_attacks?: [string, string]; // ["60", "53"]
  goals?: [string, string];             // ["2", "1"]
  injuries?: [string, string];          // ["2", "2"]
  off_target?: [string, string];        // ["7", "6"]
  on_target?: [string, string];         // ["2", "1"]
  penalties?: [string, string];         // ["1", "0"]
  redcards?: [string, string];          // ["0", "0"]
  substitutions?: [string, string];     // ["4", "2"]
  yellowcards?: [string, string];       // ["2", "3"]
  yellowred_cards?: [string, string];   // ["0", "0"]
  
  // 추가 통계들
  possession_rt?: [string, string];     // ["71", "29"] - 점유율
  fouls?: [string, string];             // ["6", "7"]
  goalattempts?: [string, string];      // ["2", "0"]
  offsides?: [string, string];          // ["2", "0"]
  saves?: [string, string];             // ["6", "0"]
  shots_blocked?: [string, string];     // ["0", "3"]
  
  // 고급 통계들 (일부 경기만)
  action_areas?: [string, string];      // ["31.20", "27.00"]
  crosses?: [string, string];           // ["8", "7"]
  crossing_accuracy?: [string, string]; // ["0.13", "0.00"]
  key_passes?: [string, string];        // ["6", "3"]
  passing_accuracy?: [string, string];  // ["0.90", "0.86"]
  xg?: [string, string];                // ["0.68", "0.08"] - Expected Goals
}

// ============================================
// 기본 경기 인터페이스 (공통)
// ============================================
export interface BetsApiBaseFixture {
  id: string;               // "10150692"
  sport_id: string;         // "1" (축구)
  time: string;             // Unix 타임스탬프 "1750865400"
  time_status: MatchTimeStatus; // 경기 상태
  
  league: BetsApiLeague;
  home: BetsApiTeam;
  away: BetsApiTeam;
  
  // 선택적 필드들
  o_home?: BetsApiTeam;     // 대체 홈팀 정보
  o_away?: BetsApiTeam;     // 대체 원정팀 정보
  
  bet365_id?: string;       // "176851311"
  round?: string;           // "14" (리그 라운드 정보)
}

// ============================================
// 예정된 경기 인터페이스 (Upcoming)
// ============================================
export interface BetsApiUpcomingFixture extends BetsApiBaseFixture {
  time_status: MatchTimeStatus.SCHEDULED;
  ss: null;                 // 예정된 경기는 항상 null
  // 예정된 경기에는 timer, scores, stats 없음
}

// ============================================
// 진행 중인 경기 인터페이스 (Inplay)
// ============================================
export interface BetsApiInplayFixture extends BetsApiBaseFixture {
  time_status: MatchTimeStatus.IN_PLAY | MatchTimeStatus.HALFTIME;
  ss: string;               // 현재 스코어 "2-1"
  
  scores: BetsApiScores;    // 세트별 스코어
  timer: BetsApiTimer;      // 실시간 타이머
  stats: BetsApiMatchStats; // 상세 경기 통계
}

// ============================================
// 종료된 경기 인터페이스 (Ended)
// ============================================
export interface BetsApiEndedFixture extends BetsApiBaseFixture {
  time_status: MatchTimeStatus.FINISHED | MatchTimeStatus.POSTPONED | MatchTimeStatus.CANCELLED;
  ss: string | null;        // 최종 스코어 "1-2" 또는 null (취소된 경우)
  
  scores?: BetsApiScores;   // 세트별 스코어 (있을 수도 없을 수도)
  stats?: BetsApiMatchStats; // 상세 경기 통계 (있을 수도 없을 수도)
}

// ============================================
// 통합 경기 인터페이스
// ============================================
export type BetsApiFixture = BetsApiUpcomingFixture | BetsApiInplayFixture | BetsApiEndedFixture;

// ============================================
// 리그 정보 인터페이스 (v1 API)
// ============================================
export interface BetsApiLeagueInfo {
  id: string;               // "40713"
  name: string;             // "Panama Liga de Futbol Nacional"
  cc: string | null;        // 국가 코드 또는 null
  has_leaguetable: number;  // 0 또는 1 (리그 테이블 존재 여부)
  has_toplist: number;      // 0 또는 1 (탑리스트 존재 여부)
}

// ============================================
// API 응답 타입들
// ============================================
export type BetsApiUpcomingResponse = BetsApiResponse<BetsApiUpcomingFixture>;
export type BetsApiInplayResponse = BetsApiResponse<BetsApiInplayFixture>;
export type BetsApiEndedResponse = BetsApiResponse<BetsApiEndedFixture>;
export type BetsApiLeaguesResponse = BetsApiResponse<BetsApiLeagueInfo>;

// ============================================
// 경기 타입 유니언
// ============================================
export type MatchType = 'upcoming' | 'inplay' | 'ended';

// ============================================
// 유틸리티 타입 가드들
// ============================================
export function isUpcomingFixture(fixture: BetsApiFixture): fixture is BetsApiUpcomingFixture {
  return fixture.time_status === MatchTimeStatus.SCHEDULED;
}

export function isInplayFixture(fixture: BetsApiFixture): fixture is BetsApiInplayFixture {
  return fixture.time_status === MatchTimeStatus.IN_PLAY || fixture.time_status === MatchTimeStatus.HALFTIME;
}

export function isEndedFixture(fixture: BetsApiFixture): fixture is BetsApiEndedFixture {
  return [MatchTimeStatus.FINISHED, MatchTimeStatus.POSTPONED, MatchTimeStatus.CANCELLED].includes(fixture.time_status as MatchTimeStatus);
}