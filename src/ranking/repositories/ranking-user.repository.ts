import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Prisma } from '@prisma/client';
import { UrlUtil } from 'src/shared/utils/url.util';

@Injectable()
export class RankingUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllRankingsByUserId(userId: string) {
    try {
      const rankings = await this.prismaService.ranking.findMany({
        where: {
          deletedAt: null,
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
          banner: {
            select: {
              url: true,
            },
          },
          createdAt: true,
          owner: {
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
          rankingCriteria: {
            select: {
              name: true,
            },
            take: 4,
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      // Processar URLs completas
      return rankings.map(ranking => ({
        ...ranking,
        banner: ranking.banner ? UrlUtil.getFullUrl(ranking.banner.url) : null,
        owner: {
          ...ranking.owner,
          avatar: {
            url: UrlUtil.getAvatarUrl(ranking.owner.avatar),
          },
        },
        criteria: ranking.rankingCriteria.map(criteria => criteria.name),
      }));
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
      const invites = await this.prismaService.rankingInvite.findMany({
        where: {
          email,
        },
        include: {
          ranking: {
            select: {
              id: true,
              name: true,
              description: true,
              banner: {
                select: {
                  url: true,
                },
              },
              rankingCriteria: {
                select: {
                  name: true,
                },
                take: 4,
                orderBy: {
                  createdAt: 'asc',
                },
              },
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

      // Processar URLs completas
      return invites.map(invite => ({
        ...invite,
        ranking: {
          ...invite.ranking,
          banner: invite.ranking.banner ? UrlUtil.getFullUrl(invite.ranking.banner.url) : null,
          criteria: invite.ranking.rankingCriteria.map(criteria => criteria.name),
        },
        invitedBy: {
          ...invite.invitedBy,
          avatar: {
            url: UrlUtil.getAvatarUrl(invite.invitedBy.avatar),
          },
        },
      }));
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
          deletedAt: null,
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

  async getRankingUsersPushTokens(rankingId: string, excludeUserId?: string) {
    try {
      const memberships = await this.prismaService.userRanking.findMany({
        where: {
          rankingId,
          ...(excludeUserId && { userId: { not: excludeUserId } }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              pushToken: true,
            },
          },
        },
      });

      Logger.debug(memberships, 'memberships');

      return memberships
        .map((m) => m.user?.pushToken)
        .filter((token): token is string => Boolean(token));
    } catch (error) {
      Logger.error(
        `Error fetching ranking users push tokens ${error}`,
        'RankingRepository.getRankingUsersPushTokens',
      );
      throw error;
    }
  }

  async removeUserFromRanking(rankingId: string, userId: string) {
    try {
      return await this.prismaService.userRanking.deleteMany({
        where: {
          rankingId,
          userId,
        },
      });
    } catch (error) {
      Logger.error(
        `Error removing user from ranking ${error}`,
        'RankingUserRepository.removeUserFromRanking',
      );
      throw error;
    }
  }

  async isRankingOwner(rankingId: string, userId: string) {
    try {
      const ranking = await this.prismaService.ranking.findUnique({
        where: { 
          id: rankingId,
          deletedAt: null,
        },
        select: { ownerId: true },
      });

      return ranking?.ownerId === userId;
    } catch (error) {
      Logger.error(
        `Error checking if user is ranking owner ${error}`,
        'RankingUserRepository.isRankingOwner',
      );
      throw error;
    }
  }

  async getRankingDetails(rankingId: string) {
    try {
      const ranking = await this.prismaService.ranking.findUnique({
        where: { 
          id: rankingId,
          deletedAt: null,
        },
        include: {
          owner: {
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
          banner: {
            select: {
              url: true,
            },
          },
          rankingCriteria: {
            select: {
              id: true,
              name: true,
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
          userRanking: {
            include: {
              user: {
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
          },
          rankingInvite: {
            select: {
              id: true,
              email: true,
              createdAt: true,
              invitedBy: {
                select: {
                  id: true,
                  name: true,
                  avatar: {
                    select: {
                      url: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!ranking) {
        return null;
      }

      // Processar URLs completas
      return {
        ...ranking,
        banner: ranking.banner ? UrlUtil.getFullUrl(ranking.banner.url) : null,
        owner: {
          ...ranking.owner,
          avatar: {
            url: UrlUtil.getAvatarUrl(ranking.owner.avatar),
          },
        },
        members: ranking.userRanking.map(membership => ({
          ...membership.user,
          avatar: {
            url: UrlUtil.getAvatarUrl(membership.user.avatar),
          },
          joinedAt: membership.createdAt,
        })),
        pendingInvites: ranking.rankingInvite.map(invite => ({
          ...invite,
          invitedBy: {
            ...invite.invitedBy,
            avatar: {
              url: UrlUtil.getAvatarUrl(invite.invitedBy.avatar),
            },
          },
        })),
        criteria: ranking.rankingCriteria,
      };
    } catch (error) {
      Logger.error(
        `Error fetching ranking details ${error}`,
        'RankingUserRepository.getRankingDetails',
      );
      throw error;
    }
  }
}
