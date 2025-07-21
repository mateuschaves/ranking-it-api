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

  async getRankingInvitesByEmail(email: string) {
    try {
      return await this.prismaService.rankingInvite.findMany({
        where: {
          email,
        },
        include: {
          ranking: {
            select: {
              id: true,
              name: true,
              description: true,
              banner: true,
            },
          },
          invitedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: {
                select: {
                  url: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      Logger.error(
        `Error fetching ranking invites by email ${error}`,
        'RankingRepository.getRankingInvitesByEmail',
      );
      throw error;
    }
  }

  async getRankingInvitesByRankingId(rankingId: string) {
    try {
      return await this.prismaService.rankingInvite.findMany({
        where: {
          rankingId,
        },
        include: {
          invitedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      Logger.error(
        `Error fetching ranking invites by ranking id ${error}`,
        'RankingRepository.getRankingInvitesByRankingId',
      );
      throw error;
    }
  }

  async getRankingInviteById(inviteId: string) {
    try {
      return await this.prismaService.rankingInvite.findUnique({
        where: {
          id: inviteId,
        },
        include: {
          ranking: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          invitedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      Logger.error(
        `Error fetching ranking invite by id ${error}`,
        'RankingRepository.getRankingInviteById',
      );
      throw error;
    }
  }

  async deleteRankingInvite(inviteId: string) {
    try {
      return await this.prismaService.rankingInvite.delete({
        where: {
          id: inviteId,
        },
      });
    } catch (error) {
      Logger.error(
        `Error deleting ranking invite ${error}`,
        'RankingRepository.deleteRankingInvite',
      );
      throw error;
    }
  }

  async addUserToRanking(userId: string, rankingId: string) {
    try {
      return await this.prismaService.userRanking.create({
        data: {
          userId,
          rankingId,
        },
      });
    } catch (error) {
      Logger.error(
        `Error adding user to ranking ${error}`,
        'RankingRepository.addUserToRanking',
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

  async existsUserInRanking(userId: string, rankingId: string) {
    try {
      const userRanking = await this.prismaService.userRanking.findFirst({
        where: { userId, rankingId },
      });
      return !!userRanking;
    } catch (error) {
      Logger.error(
        `Error checking if user is in ranking ${error}`,
        'RankingRepository.existsUserInRanking',
      );
      throw error;
    }
  }
}
