import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AbuseTargetType } from '@prisma/client';
import { RankingValidationsService } from './ranking-validations.service';
import { AbuseReportRepository } from '../repositories/abuse-report.repository';

@Injectable()
export class RankingAbuseReportService {
  constructor(
    private readonly rankingValidationsService: RankingValidationsService,
    private readonly abuseReportRepository: AbuseReportRepository,
  ) {}

  async reportRanking(
    rankingId: string,
    reportedById: string,
    description: string,
  ) {
    try {
      await this.rankingValidationsService.existRanking(rankingId);

      return await this.abuseReportRepository.create({
        targetType: AbuseTargetType.RANKING,
        description,
        rankingId,
        reportedById,
      });
    } catch (error) {
      Logger.error(error, 'RankingAbuseReportService.reportRanking');
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        'Não foi possível registrar a denúncia para o ranking 😔',
      );
    }
  }

  async reportRankingItem(
    rankingId: string,
    rankingItemId: string,
    reportedById: string,
    description: string,
  ) {
    try {
      await Promise.all([
        this.rankingValidationsService.existRanking(rankingId),
        this.rankingValidationsService.existRankingItem(rankingItemId),
      ]);

      return await this.abuseReportRepository.create({
        targetType: AbuseTargetType.ITEM,
        description,
        rankingId,
        rankingItemId,
        reportedById,
      });
    } catch (error) {
      Logger.error(error, 'RankingAbuseReportService.reportRankingItem');
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        'Não foi possível registrar a denúncia para o item 😔',
      );
    }
  }
}

