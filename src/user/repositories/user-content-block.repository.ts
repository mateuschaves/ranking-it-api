import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class UserContentBlockRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(blockerId: string, blockedUserId: string) {
    try {
      return await this.prismaService.userContentBlock.create({
        data: {
          blockerId,
          blockedUserId,
        },
        include: {
          blockedUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      Logger.error(error, 'UserContentBlockRepository.create');
      throw error;
    }
  }

  async delete(blockerId: string, blockedUserId: string) {
    try {
      return await this.prismaService.userContentBlock.deleteMany({
        where: {
          blockerId,
          blockedUserId,
        },
      });
    } catch (error) {
      Logger.error(error, 'UserContentBlockRepository.delete');
      throw error;
    }
  }

  async findBlock(blockerId: string, blockedUserId: string) {
    try {
      return await this.prismaService.userContentBlock.findFirst({
        where: {
          blockerId,
          blockedUserId,
        },
      });
    } catch (error) {
      Logger.error(error, 'UserContentBlockRepository.findBlock');
      throw error;
    }
  }

  async listBlocks(blockerId: string) {
    try {
      return await this.prismaService.userContentBlock.findMany({
        where: {
          blockerId,
        },
        include: {
          blockedUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      Logger.error(error, 'UserContentBlockRepository.listBlocks');
      throw error;
    }
  }

  async getBlockedUserIds(blockerId: string) {
    try {
      const blocks = await this.prismaService.userContentBlock.findMany({
        where: {
          blockerId,
        },
        select: {
          blockedUserId: true,
        },
      });

      return blocks.map(block => block.blockedUserId);
    } catch (error) {
      Logger.error(error, 'UserContentBlockRepository.getBlockedUserIds');
      throw error;
    }
  }
}

