import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ClsService } from 'nestjs-cls';
import { uniq, keyBy } from 'lodash';

import { AppClsStore } from '@/common/types/cls.type';
import { ClsStoreKey } from '@/common/constants/cls.constant';
import { getDataLoader } from '@/common/utils/dataloader.util';
import { TeamsService } from '@/modules/teams/services/teams.service';

import { LeagueSeasonsMongodbRepository } from '../repositories/league-seasons.mongodb.repository';
import { CreateLeagueSeasonDto } from '../dtos/create-league-season.dto';
import { UpdateLeagueSeasonDto } from '../dtos/update-league-season.dto';
import { LeagueSeasonDocument } from '../schemas/league-season.schema';

@Injectable()
export class LeagueSeasonsService {
  constructor(
    private readonly leagueSeasonsMongodbRepository: LeagueSeasonsMongodbRepository,
    private readonly teamsService: TeamsService,
    private readonly clsService: ClsService<AppClsStore>,
  ) {}

  async create(createBody: CreateLeagueSeasonDto) {
    return this.leagueSeasonsMongodbRepository.create(createBody);
  }

  async getById(id: string): Promise<LeagueSeasonDocument> {
    const dataLoaders = this.clsService.get(ClsStoreKey.DATA_LOADERS);

    return getDataLoader(dataLoaders, this.leagueSeasonsMongodbRepository).load(id);
  }

  async getAll({ skip, limit }: { skip: number; limit: number }) {
    return this.leagueSeasonsMongodbRepository.findAll({
      filter: { $or: [{ deletedAt: null }] },
      skip,
      limit,
      sort: { createdAt: -1 },
      deletedFilter: true,
    });
  }

  async update(id: string, updateBody: UpdateLeagueSeasonDto) {
    return this.leagueSeasonsMongodbRepository.updateById(new ObjectId(id), updateBody);
  }

  async softDelete(id: string) {
    return this.leagueSeasonsMongodbRepository.updateById(new ObjectId(id), { deletedAt: new Date() });
  }

  async getRanksWithTeams(leagueSeasons: LeagueSeasonDocument[]) {
    const uniqTeamIds = uniq(
      leagueSeasons.flatMap((leagueSeason) => leagueSeason.ranks.map((rank) => rank.teamId.toString())),
    );
    const teams = await Promise.all(uniqTeamIds.map((teamId) => this.teamsService.getById(teamId)));
    const teamsMap = keyBy(teams, (team) => team._id.toString());

    return leagueSeasons.map((leagueSeason) =>
      leagueSeason.ranks.map(({ rank, teamId }) => ({ rank, team: teamsMap[teamId.toString()].toJSON() })),
    );
  }
}
