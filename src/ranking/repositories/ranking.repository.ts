import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RankingRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getRankingById(rankingId: string) {
    try {
      return await this.prismaService.ranking.findFirst({
        where: {
          id: rankingId,
          deletedAt: null,
        },
      });
    } catch (error) {
      Logger.error(
        `Error fetching ranking by id ${error}`,
        'RankingRepository.getRankingById',
      );
      throw error;
    }
  }
  async createRanking(data: Prisma.RankingUncheckedCreateInput) {
    try {
      Logger.log('Creating ranking', 'RankingRepository.createRanking');
      const ranking = await this.prismaService.ranking.create({
        data,
      });

      Logger.log('Creating user ranking', 'RankingRepository.createRanking');
      await this.prismaService.userRanking.create({
        data: {
          userId: ranking.ownerId,
          rankingId: ranking.id,
        },
      });

      return ranking;
    } catch (error) {
      Logger.error(
        `Error creating ranking ${error}`,
        'RankingRepository.createRanking',
      );
      throw error;
    }
  }
  async updateRanking(rankingId: string, data: Prisma.RankingUpdateInput) {
    try {
      return await this.prismaService.ranking.update({
        where: {
          id: rankingId,
        },
        data,
      });
    } catch (error) {
      Logger.error(
        `Error updating ranking ${error}`,
        'RankingRepository.updateRanking',
      );
      throw error;
    }
  }

  async getRankingCriteria(rankingId: string) {
    try {
      return await this.prismaService.rankingCriteria.findMany({
        where: {
          rankingId,
        },
      });
    } catch (error) {
      Logger.error(
        `Error fetching ranking criteria ${error}`,
        'RankingRepository.getRankingCriteria',
      );
      throw error;
    }
  }

  async createRankingCriteria(
    data: Prisma.RankingCriteriaUncheckedCreateInput,
  ) {
    try {
      return await this.prismaService.rankingCriteria.create({
        data,
      });
    } catch (error) {
      Logger.error(
        `Error creating ranking criteria ${error}`,
        'RankingRepository.createRankingCriteria',
      );
      throw error;
    }
  }

  async removeRankingCriteria(rankingCriteria: string) {
    try {
      return await this.prismaService.rankingCriteria.delete({
        where: {
          id: rankingCriteria,
        },
      });
    } catch (error) {
      Logger.error(
        `Error removing ranking criteria ${error}`,
        'RankingRepository.removeRankingCriteria',
      );
      throw error;
    }
  }

  async deleteRanking(rankingId: string) {
    try {
      return await this.prismaService.ranking.update({
        where: {
          id: rankingId,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      Logger.error(
        `Error soft deleting ranking ${error}`,
        'RankingRepository.deleteRanking',
      );
      throw error;
    }
  }
}
