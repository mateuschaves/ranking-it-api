import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AbuseReportRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: Prisma.AbuseReportUncheckedCreateInput) {
    try {
      return await this.prismaService.abuseReport.create({
        data,
        include: {
          ranking: {
            select: {
              id: true,
              name: true,
            },
          },
          rankingItem: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      Logger.error(
        `Error creating abuse report ${error}`,
        'AbuseReportRepository.create',
      );
      throw error;
    }
  }
}

