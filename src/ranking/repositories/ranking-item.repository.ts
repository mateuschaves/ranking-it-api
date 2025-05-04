import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Prisma, RankingItemUserPhoto } from '@prisma/client';

interface CreateRankingItemUserPhoto {
  rankingItemId: string;
  userId: string;
  photoId: string;
}

@Injectable()
export class RankingItemRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createRankingItem(data: Prisma.RankingItemUncheckedCreateInput) {
    try {
      return await this.prismaService.rankingItem.create({
        data,
      });
    } catch (error) {
      Logger.error(
        `Error creating ranking item ${error}`,
        'RankingRepository.createRankingItem',
      );
      throw error;
    }
  }

  async getRankingItems(rankingId: string) {
    try {
      return await this.prismaService.rankingItem.findMany({
        where: {
          rankingId,
        },
        omit: {
          rankingId: true,
          createdById: true,
        },
        include: {
          rankingItemUserPhoto: {
            select: {
              id: true,
              photoId: true,
              userId: true,
              createdAt: true,
              photo: {
                select: {
                  url: true,
                },
              },
            },
          },
          createdByUser: {
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
        `Error fetching ranking items ${error}`,
        'RankingRepository.getRankingItems',
      );
      throw error;
    }
  }

  async getRankingItemById(rankingItemId: string) {
    try {
      return await this.prismaService.rankingItem.findUnique({
        where: {
          id: rankingItemId,
        },
      });
    } catch (error) {
      Logger.error(
        `Error fetching ranking item by id ${error}`,
        'RankingRepository.getRankingItemById',
      );
      throw error;
    }
  }

  async deleteRankingItem(rankingItemId: string) {
    try {
      return await this.prismaService.rankingItem.delete({
        where: {
          id: rankingItemId,
        },
      });
    } catch (error) {
      Logger.error(
        `Error deleting ranking item ${error}`,
        'RankingRepository.deleteRankingItem',
      );
      throw error;
    }
  }

  async createRankingItemUserPhoto({
    rankingItemId,
    userId,
    photoId,
  }: CreateRankingItemUserPhoto): Promise<RankingItemUserPhoto> {
    try {
      return await this.prismaService.rankingItemUserPhoto.create({
        data: {
          rankingItemId,
          photoId,
          userId,
        },
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      Logger.error(
        `Error creating ranking item user photo: ${message}`,
        'RankingRepository.createRankingItemUserPhoto',
      );
      throw error instanceof Error
        ? error
        : new Error('Unknown error creating ranking item user photo');
    }
  }
}
