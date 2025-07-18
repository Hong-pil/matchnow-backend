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
  bet365_id?: string;
  round?: string;
  _id?: string;
  adminNote?: string;
  isModified: boolean;
  isLocalOnly?: boolean;
  localData?: any;
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