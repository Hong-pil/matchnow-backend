// src/modules/football-matches/services/football-matches.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
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

  async update(id: string, updateDto: UpdateFootballMatchDto): Promise<FootballMatchDocument> {
    const existingMatch = await this.getById(id);
    if (!existingMatch) {
      throw new NotFoundException('경기를 찾을 수 없습니다.');
    }

    const updatedMatch = await this.footballMatchesRepository.updateById(new ObjectId(id), updateDto);
    if (!updatedMatch) {
      throw new NotFoundException('경기 업데이트에 실패했습니다.');
    }

    return updatedMatch;
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

    // 완전 삭제 표시로 변경
    await this.footballMatchesRepository.updateById(new ObjectId(id), { 
      deletedAt: new Date(),
      status: 'permanently_deleted'
    });
  }

  // BetsAPI 데이터를 로컬 DB에 동기화
  async syncFromBetsApi(betsApiMatches: any[]): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;

    for (const match of betsApiMatches) {
      const existingMatch = await this.getByBetsApiId(match.id);
      
      if (existingMatch) {
        // 기존 경기 업데이트 (시간, 스코어 등)
        await this.footballMatchesRepository.updateById(existingMatch._id, {
          time: match.time,
          time_status: match.time_status,
          ss: match.ss,
          scores: match.scores,
          timer: match.timer,
        });
        updated++;
      } else {
        // 새 경기 생성
        await this.create({
          betsApiId: match.id,
          sport_id: match.sport_id,
          time: match.time,
          time_status: match.time_status,
          league: match.league,
          home: match.home,
          away: match.away,
          ss: match.ss,
          scores: match.scores,
          timer: match.timer,
          bet365_id: match.bet365_id,
          round: match.round,
          status: 'active',
        });
        created++;
      }
    }

    return { created, updated };
  }

  // 관리자가 수정한 경기와 BetsAPI 데이터 병합
  async getMergedMatches(type: 'upcoming' | 'inplay' | 'ended', betsApiMatches: any[]): Promise<MergedMatch[]> {
    // 로컬 DB에서 해당 타입의 경기들 가져오기
    const localMatches = await this.getByTimeStatus(
      type === 'upcoming' ? '0' : type === 'inplay' ? '1' : '3'
    );

    // BetsAPI 데이터와 로컬 데이터 병합
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
          isModified: true, // 관리자가 수정한 경기 표시
          localData: localMatch.toObject(),
        });
        localMatchMap.delete(betsMatch.id); // 처리된 것은 Map에서 제거
      } else {
        // BetsAPI 원본 데이터 사용
        mergedMatches.push({
          ...betsMatch,
          isModified: false,
        });
      }
    }

    // BetsAPI에 없지만 로컬에만 있는 경기들 추가 (관리자가 직접 추가한 경기)
    for (const [, localMatch] of localMatchMap) {
      mergedMatches.push({
        id: localMatch.betsApiId,
        sport_id: localMatch.sport_id,
        time: localMatch.time,
        time_status: localMatch.time_status,
        league: localMatch.league,
        home: localMatch.home,
        away: localMatch.away,
        ss: localMatch.ss,
        scores: localMatch.scores,
        timer: localMatch.timer,
        bet365_id: localMatch.bet365_id,
        round: localMatch.round,
        _id: localMatch._id.toString(),
        adminNote: localMatch.adminNote,
        isModified: true,
        isLocalOnly: true, // 로컬에만 있는 경기 표시
        localData: localMatch.toObject(),
      });
    }

    return mergedMatches.sort((a, b) => parseInt(a.time) - parseInt(b.time));
  }
}