import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Prisma } from '@prisma/client';

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
}
