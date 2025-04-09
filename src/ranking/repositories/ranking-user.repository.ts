import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RankingUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllRankingsByUserId(userId: string) {
    try {
      return await this.prismaService.ranking.findMany({
        where: {
          userRanking: {
            some: {
              userId,
            },
          },
        },
        select: {
          id: true,
          name: true,
          description: true,
          banner: true,
          createdAt: true,
        },
      });
    } catch (error) {
      Logger.error(
        `Error fetching all rankings by user id ${error}`,
        'RankingRepository.getAllRankingsByUserId',
      );
      throw error;
    }
  }
  async createRankingInvite(data: Prisma.RankingInviteUncheckedCreateInput) {
    try {
      return await this.prismaService.rankingInvite.create({
        data,
      });
    } catch (error) {
      Logger.error(
        `Error creating ranking invite ${error}`,
        'RankingRepository.createRankingInvite',
      );
      throw error;
    }
  }
  async getRankingUserById(rankingId: string, userId: string) {
    try {
      return await this.prismaService.ranking.findUnique({
        where: {
          id: rankingId,
          userRanking: {
            some: {
              userId,
            },
          },
        },
      });
    } catch (error) {
      Logger.error(
        `Error fetching ranking user by id ${error}`,
        'RankingRepository.getRankingUserById',
      );
      throw error;
    }
  }
}
