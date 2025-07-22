// src/modules/football-matches/services/football-matches.service.ts (완전 데이터 저장 버전)
import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common'; // 🆕 BadRequestException 추가
import { ObjectId } from 'mongodb';
import { ClsService } from 'nestjs-cls';
import { AppClsStore } from '@/common/types/cls.type';
import { ClsStoreKey } from '@/common/constants/cls.constant';
import { getDataLoader } from '@/common/utils/dataloader.util';
import { FootballMatchesMongodbRepository } from '../repositories/football-matches.mongodb.repository';
import { CreateFootballMatchDto } from '../dtos/create-football-match.dto';
import { UpdateFootballMatchDto } from '../dtos/update-football-match.dto';
import { FootballMatchDocument } from '../schemas/football-match.schema';
import { MergedMatch } from '../types/football-match.types';

@Injectable()
export class FootballMatchesService {
  private readonly logger = new Logger(FootballMatchesService.name);

  constructor(
    private readonly footballMatchesRepository: FootballMatchesMongodbRepository,
    private readonly clsService: ClsService<AppClsStore>,
  ) {}

  async create(createDto: CreateFootballMatchDto): Promise<FootballMatchDocument> {
    return this.footballMatchesRepository.create(createDto);
  }

  async getById(id: string): Promise<FootballMatchDocument> {
    const dataLoaders = this.clsService.get(ClsStoreKey.DATA_LOADERS);
    const match = await getDataLoader(dataLoaders, this.footballMatchesRepository).load(id);
    
    if (!match) {
      throw new NotFoundException('경기를 찾을 수 없습니다.');
    }
    
    return match;
  }

  async getByBetsApiId(betsApiId: string): Promise<FootballMatchDocument | null> {
    return this.footballMatchesRepository.findByBetsApiId(betsApiId);
  }

  async getAll({ skip, limit }: { skip: number; limit: number }) {
    return this.footballMatchesRepository.findAll({
      filter: { deletedAt: null, status: 'active' },
      skip,
      limit,
      sort: { time: 1 },
      deletedFilter: false,
    });
  }

  async getByTimeStatus(timeStatus: string, limit?: number): Promise<FootballMatchDocument[]> {
    return this.footballMatchesRepository.findByTimeStatus(timeStatus, limit);
  }

  async getByDateRange(startDate: string, endDate: string): Promise<FootballMatchDocument[]> {
    return this.footballMatchesRepository.findByDateRange(startDate, endDate);
  }

  // 🔧 수정: update 메서드 개선 (에러 핸들링 및 로깅 추가)
  async update(id: string, updateDto: UpdateFootballMatchDto): Promise<FootballMatchDocument> {
    this.logger.log(`경기 업데이트 요청 - ID: ${id}, 업데이트 필드:`, Object.keys(updateDto));
    
    try {
      // ObjectId 형식 검증
      if (!ObjectId.isValid(id)) {
        throw new BadRequestException(`올바르지 않은 ObjectId 형식입니다: ${id}`);
      }

      // 기존 경기 확인
      const existingMatch = await this.footballMatchesRepository.findById(new ObjectId(id));
      if (!existingMatch) {
        throw new NotFoundException(`경기를 찾을 수 없습니다. ID: ${id}`);
      }

      this.logger.log(`기존 경기 발견: ${existingMatch.home?.name} vs ${existingMatch.away?.name}`);

      // 업데이트 실행
      const updatedMatch = await this.footballMatchesRepository.updateById(
        new ObjectId(id), 
        {
          ...updateDto,
          updatedAt: new Date(), // 수정 시간 자동 업데이트
        }
      );

      if (!updatedMatch) {
        throw new NotFoundException('경기 업데이트에 실패했습니다.');
      }

      this.logger.log(`경기 업데이트 완료 - ID: ${id}`);
      
      // 🆕 특정 필드 업데이트 로깅
      if ('allowSync' in updateDto) {
        this.logger.log(`동기화 허용 상태 변경: ${existingMatch.allowSync} → ${updateDto.allowSync}`);
      }

      return updatedMatch;
    } catch (error) {
      this.logger.error(`경기 업데이트 실패 - ID: ${id}`, error.stack);
      throw error;
    }
  }

  async softDelete(id: string): Promise<FootballMatchDocument> {
    const existingMatch = await this.getById(id);
    if (!existingMatch) {
      throw new NotFoundException('경기를 찾을 수 없습니다.');
    }

    const deletedMatch = await this.footballMatchesRepository.updateById(new ObjectId(id), { 
      deletedAt: new Date(),
      status: 'deleted'
    });
    
    if (!deletedMatch) {
      throw new NotFoundException('경기 삭제에 실패했습니다.');
    }

    return deletedMatch;
  }

  async hardDelete(id: string): Promise<void> {
    const existingMatch = await this.getById(id);
    if (!existingMatch) {
      throw new NotFoundException('경기를 찾을 수 없습니다.');
    }

    await this.footballMatchesRepository.updateById(new ObjectId(id), { 
      deletedAt: new Date(),
      status: 'permanently_deleted'
    });
  }

  // ⭐ 완전한 BetsAPI 데이터를 로컬 DB에 동기화 (모든 필드 저장)
  async syncFromBetsApi(betsApiMatches: any[]): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;

  this.logger.log(`🔄 BetsAPI 데이터 동기화 시작 - ${betsApiMatches.length}개 경기`);

  for (const match of betsApiMatches) {
    try {
      const existingMatch = await this.getByBetsApiId(match.id);
      
      // 완전한 경기 데이터 매핑
      const fullMatchData = this.mapBetsApiToFullSchema(match);
      
      if (existingMatch) {
        // 기존 경기 업데이트 (모든 필드)
        await this.footballMatchesRepository.updateById(existingMatch._id, {
          ...fullMatchData,
          lastSyncAt: new Date(),
        });
        updated++;
        this.logger.debug(`✏️ 경기 업데이트: ${match.home?.name} vs ${match.away?.name}`);
      } else {
        // 🔧 타입 안전성을 위한 필수 필드 검증 및 기본값 설정
        const createData: CreateFootballMatchDto = {
          betsApiId: match.id,
          sport_id: fullMatchData.sport_id || '1', // 기본값 설정
          time: fullMatchData.time || Math.floor(Date.now() / 1000).toString(), // 기본값 설정
          time_status: fullMatchData.time_status || '0', // 기본값 설정
          league: fullMatchData.league || {
            id: 'unknown',
            name: 'Unknown League'
          },
          home: fullMatchData.home || {
            id: 'unknown_home',
            name: 'Unknown Home Team'
          },
          away: fullMatchData.away || {
            id: 'unknown_away',
            name: 'Unknown Away Team'
          },
          // 선택적 필드들
          o_home: fullMatchData.o_home,
          o_away: fullMatchData.o_away,
          ss: fullMatchData.ss,
          scores: fullMatchData.scores,
          timer: fullMatchData.timer,
          stats: fullMatchData.stats,
          bet365_id: fullMatchData.bet365_id,
          round: fullMatchData.round,
          // 메타데이터
          dataSource: 'betsapi',
          lastSyncAt: new Date(),
          status: 'active',
        };

        await this.create(createData);
        created++;
        this.logger.debug(`🆕 경기 생성: ${match.home?.name} vs ${match.away?.name}`);
      }
    } catch (error) {
      this.logger.error(`❌ 경기 동기화 실패 (ID: ${match.id}):`, error.message);
    }
  }

  this.logger.log(`✅ 동기화 완료 - 생성: ${created}, 업데이트: ${updated}`);
  return { created, updated };
}

  // ⭐ BetsAPI 데이터를 완전한 스키마로 매핑
  private mapBetsApiToFullSchema(betsApiMatch: any): Partial<FootballMatchDocument> {
  return {
    sport_id: betsApiMatch.sport_id || '1',
    time: betsApiMatch.time || Math.floor(Date.now() / 1000).toString(),
    time_status: betsApiMatch.time_status || '0',
    league: betsApiMatch.league ? {
      id: betsApiMatch.league.id || 'unknown',
      name: betsApiMatch.league.name || 'Unknown League',
      cc: betsApiMatch.league.cc,
    } : {
      id: 'unknown',
      name: 'Unknown League'
    },
    home: betsApiMatch.home ? {
      id: betsApiMatch.home.id || 'unknown_home',
      name: betsApiMatch.home.name || 'Unknown Home Team',
      image_id: betsApiMatch.home.image_id,
      cc: betsApiMatch.home.cc,
    } : {
      id: 'unknown_home',
      name: 'Unknown Home Team'
    },
    away: betsApiMatch.away ? {
      id: betsApiMatch.away.id || 'unknown_away',
      name: betsApiMatch.away.name || 'Unknown Away Team',
      image_id: betsApiMatch.away.image_id,
      cc: betsApiMatch.away.cc,
    } : {
      id: 'unknown_away',
      name: 'Unknown Away Team'
    },
    // 대체 팀 정보 (안전하게 처리)
    o_home: betsApiMatch.o_home ? {
      id: betsApiMatch.o_home.id,
      name: betsApiMatch.o_home.name,
      image_id: betsApiMatch.o_home.image_id,
      cc: betsApiMatch.o_home.cc,
    } : undefined,
    o_away: betsApiMatch.o_away ? {
      id: betsApiMatch.o_away.id,
      name: betsApiMatch.o_away.name,
      image_id: betsApiMatch.o_away.image_id,
      cc: betsApiMatch.o_away.cc,
    } : undefined,
    ss: betsApiMatch.ss,
    scores: betsApiMatch.scores,
    timer: betsApiMatch.timer,
    // ⭐ 완전한 통계 데이터 저장 (안전하게 처리)
    stats: betsApiMatch.stats ? {
      // 공격 통계
      attacks: betsApiMatch.stats.attacks,
      dangerous_attacks: betsApiMatch.stats.dangerous_attacks,
      
      // 볼 점유 및 패스
      ball_safe: betsApiMatch.stats.ball_safe,
      passing_accuracy: betsApiMatch.stats.passing_accuracy,
      key_passes: betsApiMatch.stats.key_passes,
      crosses: betsApiMatch.stats.crosses,
      crossing_accuracy: betsApiMatch.stats.crossing_accuracy,
      possession_rt: betsApiMatch.stats.possession_rt,
      
      // 슛 관련
      goalattempts: betsApiMatch.stats.goalattempts,
      on_target: betsApiMatch.stats.on_target,
      off_target: betsApiMatch.stats.off_target,
      shots_blocked: betsApiMatch.stats.shots_blocked,
      saves: betsApiMatch.stats.saves,
      
      // 골
      goals: betsApiMatch.stats.goals,
      xg: betsApiMatch.stats.xg, // Expected Goals
      
      // 코너킥
      corners: betsApiMatch.stats.corners,
      corner_f: betsApiMatch.stats.corner_f,
      corner_h: betsApiMatch.stats.corner_h,
      
      // 카드
      yellowcards: betsApiMatch.stats.yellowcards,
      redcards: betsApiMatch.stats.redcards,
      yellowred_cards: betsApiMatch.stats.yellowred_cards,
      
      // 파울 및 오프사이드
      fouls: betsApiMatch.stats.fouls,
      offsides: betsApiMatch.stats.offsides,
      
      // 페널티
      penalties: betsApiMatch.stats.penalties,
      
      // 부상 및 교체
      injuries: betsApiMatch.stats.injuries,
      substitutions: betsApiMatch.stats.substitutions,
      
      // 액션 에리어
      action_areas: betsApiMatch.stats.action_areas,
    } : undefined,
    bet365_id: betsApiMatch.bet365_id,
    round: betsApiMatch.round,
  };
}

  // 관리자가 수정한 경기와 BetsAPI 데이터 병합
  async getMergedMatches(type: 'upcoming' | 'inplay' | 'ended', betsApiMatches: any[]): Promise<MergedMatch[]> {
    const localMatches = await this.getByTimeStatus(
      type === 'upcoming' ? '0' : type === 'inplay' ? '1' : '3'
    );

    const mergedMatches: MergedMatch[] = [];
    const localMatchMap = new Map(localMatches.map(match => [match.betsApiId, match]));

    // BetsAPI 데이터에 로컬 수정사항 적용
    for (const betsMatch of betsApiMatches) {
      const localMatch = localMatchMap.get(betsMatch.id);
      
      if (localMatch) {
        // 로컬에 수정된 데이터가 있으면 그것을 우선 사용
        mergedMatches.push({
          ...betsMatch,
          _id: localMatch._id.toString(),
          adminNote: localMatch.adminNote,
          isModified: true,
          localData: localMatch.toObject(),
          // 완전한 통계 포함
          fullStats: localMatch.stats,
        });
        localMatchMap.delete(betsMatch.id);
      } else {
        // BetsAPI 원본 데이터 사용
        mergedMatches.push({
          ...betsMatch,
          isModified: false,
        });
      }
    }

    // BetsAPI에 없지만 로컬에만 있는 경기들 추가
    for (const [, localMatch] of localMatchMap) {
      mergedMatches.push({
        id: localMatch.betsApiId,
        sport_id: localMatch.sport_id,
        time: localMatch.time,
        time_status: localMatch.time_status,
        league: localMatch.league,
        home: localMatch.home,
        away: localMatch.away,
        o_home: localMatch.o_home,
        o_away: localMatch.o_away,
        ss: localMatch.ss,
        scores: localMatch.scores,
        timer: localMatch.timer,
        stats: localMatch.stats, // 완전한 통계 포함
        bet365_id: localMatch.bet365_id,
        round: localMatch.round,
        _id: localMatch._id.toString(),
        adminNote: localMatch.adminNote,
        isModified: true,
        isLocalOnly: true,
        localData: localMatch.toObject(),
        fullStats: localMatch.stats,
      });
    }

    return mergedMatches.sort((a, b) => parseInt(a.time) - parseInt(b.time));
  }

  // ⭐ 통계 데이터 분석 메서드
  async getDetailedMatchStats(matchId: string): Promise<any> {
    const match = await this.getById(matchId);
    
    if (!match.stats) {
      return { message: '통계 데이터가 없습니다.' };
    }

    // 통계 분석
    const stats = match.stats;
    const analysis = {
      possession: {
        home: stats.possession_rt?.[0] || '0',
        away: stats.possession_rt?.[1] || '0',
      },
      shots: {
        home: {
          total: stats.goalattempts?.[0] || '0',
          on_target: stats.on_target?.[0] || '0',
          off_target: stats.off_target?.[0] || '0',
          accuracy: stats.on_target?.[0] && stats.goalattempts?.[0] 
            ? ((parseInt(stats.on_target[0]) / parseInt(stats.goalattempts[0])) * 100).toFixed(1) + '%'
            : '0%',
        },
        away: {
          total: stats.goalattempts?.[1] || '0',
          on_target: stats.on_target?.[1] || '0',
          off_target: stats.off_target?.[1] || '0',
          accuracy: stats.on_target?.[1] && stats.goalattempts?.[1]
            ? ((parseInt(stats.on_target[1]) / parseInt(stats.goalattempts[1])) * 100).toFixed(1) + '%'
            : '0%',
        },
      },
      xg: {
        home: stats.xg?.[0] || '0',
        away: stats.xg?.[1] || '0',
      },
      cards: {
        home: {
          yellow: stats.yellowcards?.[0] || '0',
          red: stats.redcards?.[0] || '0',
        },
        away: {
          yellow: stats.yellowcards?.[1] || '0',
          red: stats.redcards?.[1] || '0',
        },
      },
      performance: {
        home_dominance: this.calculateDominance(stats, 'home'),
        away_dominance: this.calculateDominance(stats, 'away'),
      },
    };

    return analysis;
  }

  // 팀 지배력 계산 (0-100 점수)
  private calculateDominance(stats: any, team: 'home' | 'away'): number {
    const index = team === 'home' ? 0 : 1;
    const opponentIndex = team === 'home' ? 1 : 0;
    
    const possession = parseInt(stats.possession_rt?.[index] || '0');
    const attacks = parseInt(stats.attacks?.[index] || '0');
    const opponentAttacks = parseInt(stats.attacks?.[opponentIndex] || '0');
    const dangerousAttacks = parseInt(stats.dangerous_attacks?.[index] || '0');
    const opponentDangerousAttacks = parseInt(stats.dangerous_attacks?.[opponentIndex] || '0');
    const onTarget = parseInt(stats.on_target?.[index] || '0');
    const opponentOnTarget = parseInt(stats.on_target?.[opponentIndex] || '0');
    
    // 가중치 적용한 지배력 계산
    let dominanceScore = 0;
    
    // 점유율 (40% 가중치)
    dominanceScore += possession * 0.4;
    
    // 공격 비율 (30% 가중치)
    const totalAttacks = attacks + opponentAttacks;
    if (totalAttacks > 0) {
      dominanceScore += (attacks / totalAttacks) * 100 * 0.3;
    }
    
    // 위험한 공격 비율 (20% 가중치)
    const totalDangerousAttacks = dangerousAttacks + opponentDangerousAttacks;
    if (totalDangerousAttacks > 0) {
      dominanceScore += (dangerousAttacks / totalDangerousAttacks) * 100 * 0.2;
    }
    
    // 유효슛 비율 (10% 가중치)
    const totalOnTarget = onTarget + opponentOnTarget;
    if (totalOnTarget > 0) {
      dominanceScore += (onTarget / totalOnTarget) * 100 * 0.1;
    }
    
    return Math.round(dominanceScore);
  }

  // ⭐ 경기 품질 평가
  async assessMatchQuality(matchId: string): Promise<any> {
    const match = await this.getById(matchId);
    
    if (!match.stats) {
      return { quality: 'unknown', reason: '통계 데이터 없음' };
    }

    const stats = match.stats;
    
    // 총 골
    const totalGoals = parseInt(stats.goals?.[0] || '0') + parseInt(stats.goals?.[1] || '0');
    
    // 총 슛
    const totalShots = parseInt(stats.goalattempts?.[0] || '0') + parseInt(stats.goalattempts?.[1] || '0');
    
    // 총 유효슛
    const totalOnTarget = parseInt(stats.on_target?.[0] || '0') + parseInt(stats.on_target?.[1] || '0');
    
    // 총 위험한 공격
    const totalDangerousAttacks = parseInt(stats.dangerous_attacks?.[0] || '0') + parseInt(stats.dangerous_attacks?.[1] || '0');
    
    // 경기 품질 점수 계산
    let qualityScore = 0;
    
    // 골 (25점)
    qualityScore += Math.min(totalGoals * 5, 25);
    
    // 슛 (25점)
    qualityScore += Math.min(totalShots * 1.5, 25);
    
    // 유효슛 (25점)
    qualityScore += Math.min(totalOnTarget * 3, 25);
    
    // 위험한 공격 (25점)
    qualityScore += Math.min(totalDangerousAttacks * 0.5, 25);
    
    let quality = '';
    let description = '';
    
    if (qualityScore >= 80) {
      quality = 'excellent';
      description = '매우 흥미진진한 경기';
    } else if (qualityScore >= 60) {
      quality = 'good';
      description = '좋은 경기';
    } else if (qualityScore >= 40) {
      quality = 'average';
      description = '평범한 경기';
    } else {
      quality = 'poor';
      description = '지루한 경기';
    }

    return {
      quality,
      score: Math.round(qualityScore),
      description,
      metrics: {
        totalGoals,
        totalShots,
        totalOnTarget,
        totalDangerousAttacks,
      },
    };
  }

  // ⭐ 데이터 완성도 체크
  async checkDataCompleteness(): Promise<any> {
    const matches = await this.footballMatchesRepository.findAll({
      filter: { deletedAt: null, status: 'active' },
      limit: 1000,
      deletedFilter: false,
    });

    const analysis = {
      total_matches: matches.totalCount,
      with_stats: 0,
      with_o_teams: 0,
      with_xg: 0,
      with_possession: 0,
      with_timer: 0,
      completeness_percentage: 0,
      missing_fields: {
        stats: 0,
        o_home: 0,
        o_away: 0,
        xg: 0,
        possession_rt: 0,
        timer: 0,
      },
    };

    for (const match of matches.results) {
      // 통계 데이터 유무
      if (match.stats) {
        analysis.with_stats++;
        
        if (match.stats.xg) analysis.with_xg++;
        if (match.stats.possession_rt) analysis.with_possession++;
      } else {
        analysis.missing_fields.stats++;
      }

      // 대체 팀 정보
      if (match.o_home) analysis.with_o_teams++;
      else analysis.missing_fields.o_home++;

      if (match.o_away) analysis.with_o_teams++;
      else analysis.missing_fields.o_away++;

      // 타이머 정보
      if (match.timer) analysis.with_timer++;
      else analysis.missing_fields.timer++;
    }

    // 완성도 계산 (핵심 필드 기준)
    const completenessFields = [
      analysis.with_stats / analysis.total_matches,
      analysis.with_xg / analysis.total_matches,
      analysis.with_possession / analysis.total_matches,
      analysis.with_timer / analysis.total_matches,
    ];

    analysis.completeness_percentage = Math.round(
      (completenessFields.reduce((sum, field) => sum + field, 0) / completenessFields.length) * 100
    );

    return analysis;
  }

  // ⭐ 누락 데이터 재동기화
  async resyncIncompleteMatches(): Promise<{ resynced: number; errors: number }> {
    this.logger.log('🔄 불완전한 경기 데이터 재동기화 시작');

    const incompleteMatches = await this.footballMatchesRepository.findAll({
      filter: { 
        deletedAt: null, 
        status: 'active',
        $or: [
          { stats: { $exists: false } },
          { stats: null },
          { 'stats.xg': { $exists: false } },
          { 'stats.possession_rt': { $exists: false } },
        ]
      },
      limit: 100, // 한 번에 100개씩
      deletedFilter: false,
    });

    let resynced = 0;
    let errors = 0;

    for (const match of incompleteMatches.results) {
      try {
        // BetsAPI에서 최신 데이터 가져오기 (실제로는 BetsAPI 서비스 호출)
        // 여기서는 시뮬레이션
        this.logger.debug(`🔄 재동기화: ${match.betsApiId}`);
        
        await this.footballMatchesRepository.updateById(match._id, {
          lastSyncAt: new Date(),
          // 실제로는 BetsAPI에서 가져온 완전한 데이터로 업데이트
        });
        
        resynced++;
      } catch (error) {
        this.logger.error(`❌ 재동기화 실패 (ID: ${match.betsApiId}):`, error.message);
        errors++;
      }
    }

    this.logger.log(`✅ 재동기화 완료 - 성공: ${resynced}, 실패: ${errors}`);
    return { resynced, errors };
  }
}