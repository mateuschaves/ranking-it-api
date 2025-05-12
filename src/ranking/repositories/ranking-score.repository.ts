import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RankingScoreRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createRankingScore(data: Prisma.RankingItemScoreUncheckedCreateInput) {
    try {
      return await this.prismaService.rankingItemScore.create({
        data,
      });
    } catch (error) {
      Logger.error(
        `Error creating ranking score ${error}`,
        'RankingRepository.createRankingScore',
      );
      throw error;
    }
  }

  async deleteRankingScore(rankingScoreId: string) {
    try {
      return await this.prismaService.rankingItemScore.delete({
        where: {
          id: rankingScoreId,
        },
      });
    } catch (error) {
      Logger.error(
        `Error deleting ranking score ${error}`,
        'RankingRepository.deleteRankingScore',
      );
      throw error;
    }
  }

  async getRankingScores(rankingItemId: string) {
    try {
      return await this.prismaService.rankingItemScore.findMany({
        where: {
          rankingItemId,
        },
        select: {
          id: true,
          score: true,
          userId: true,
          rankingItemId: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });
    } catch (error) {
      Logger.error(
        `Error fetching ranking scores ${error}`,
        'RankingRepository.getRankingScores',
      );
      throw error;
    }
  }

  async getRankingScoreByItemId(rankingItemId: string) {
    try {
      return await this.prismaService.rankingItemScore.findMany({
        where: {
          rankingItemId,
        },
        select: {
          id: true,
          score: true,
          userId: true,
          rankingItemId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      Logger.error(
        `Error fetching ranking score by item id ${error}`,
        'RankingRepository.getRankingScoreByItemId',
      );
      throw error;
    }
  }

  async updateRankingScore(
    rankingScoreId: string,
    data: Prisma.RankingItemScoreUncheckedUpdateInput,
  ) {
    try {
      return await this.prismaService.rankingItemScore.update({
        where: {
          id: rankingScoreId,
        },
        data,
      });
    } catch (error) {
      Logger.error(
        `Error updating ranking score ${error}`,
        'RankingRepository.updateRankingScore',
      );
      throw error;
    }
  }

  async getRankingScoreById(rankingScoreId: string) {
    try {
      return await this.prismaService.rankingItemScore.findUnique({
        where: {
          id: rankingScoreId,
        },
      });
    } catch (error) {
      Logger.error(
        `Error fetching ranking score by id ${error}`,
        'RankingRepository.getRankingScoreById',
      );
      throw error;
    }
  }

  async getAvgRankingItemScore(rankingItemId: string) {
    try {
      return (
        await this.prismaService.rankingItemScore.aggregate({
          where: {
            rankingItemId,
          },
          _avg: {
            score: true,
          },
        })
      )._avg;
    } catch (error) {
      Logger.error(
        `Error fetching average ranking score ${error}`,
        'RankingRepository.getAvgRankingItemScore',
      );
      throw error;
    }
  }

  async getRankingCriteriaById(rankingCriteriaId: string) {
    try {
      return await this.prismaService.rankingCriteria.findUnique({
        where: {
          id: rankingCriteriaId,
        },
      });
    } catch (error) {
      Logger.error(
        `Error fetching ranking criteria by id ${error}`,
        'RankingRepository.getRankingCriteriaById',
      );
      throw error;
    }
  }
}
