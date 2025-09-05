import { BadRequestException, Injectable } from '@nestjs/common';
import { RankingValidationsService } from './ranking-validations.service';
import { RankingScoreRepository } from '../repositories/ranking-score.repository';
import CreateRankingItemScoreDto from '../dto/create-ranking-item-score.dto';
import { RankingUserRepository } from '../repositories/ranking-user.repository';
import { ExpoPushService } from 'src/shared/services/expo-push.service';

@Injectable()
export class RankingScoreService {
  constructor(
    private readonly rankingScoreRepository: RankingScoreRepository,
    private readonly rankingValidationsService: RankingValidationsService,
    private readonly rankingUserRepository: RankingUserRepository,
    private readonly expoPushService: ExpoPushService,
  ) {}

  async createRankingScore(createRankingScoreDto: CreateRankingItemScoreDto) {
    try {
      const { rankingItemId, userId, score } = createRankingScoreDto;

      await Promise.all([
        this.rankingValidationsService.existRankingItem(rankingItemId),
        this.rankingValidationsService.existRankingCriteria(
          createRankingScoreDto.rankingCriteriaId,
        ),
      ]);

      const existScore =
        await this.rankingValidationsService.existRankingItemCriteriaScore(
          rankingItemId,
          userId,
          createRankingScoreDto.rankingCriteriaId,
        );

      if (existScore?.id) {
        const updated = await this.rankingScoreRepository.updateRankingScore(
          existScore.id,
          {
            score,
          },
        );
        // Notify ranking users about score update
        try {
          const rankingItem = await this.rankingValidationsService.existRankingItem(rankingItemId);
          const tokens = await this.rankingUserRepository.getRankingUsersPushTokens(
            rankingItem.rankingId,
            userId,
          );
          if (tokens?.length > 0) {
            await this.expoPushService.sendBulkPushNotifications(
              tokens,
              'Item avaliado 📝',
              'Uma pontuação do item do ranking foi atualizada.',
            );
          }
        } catch {}
        return updated;
      } else {
        const created = await this.rankingScoreRepository.createRankingScore({
          userId,
          score,
          rankingItemId,
          rankingCriteriaId: createRankingScoreDto.rankingCriteriaId,
        });
        // Notify ranking users about new evaluation
        try {
          const rankingItem = await this.rankingValidationsService.existRankingItem(rankingItemId);
          const tokens = await this.rankingUserRepository.getRankingUsersPushTokens(
            rankingItem.rankingId,
            userId,
          );
          if (tokens?.length > 0) {
            await this.expoPushService.sendBulkPushNotifications(
              tokens,
              'Novo voto no ranking ✅',
              'Um item recebeu uma nova avaliação.',
            );
          }
        } catch {}
        return created;
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        'Não foi possível criar a pontuação do item do ranking 😔',
      );
    }
  }

  async getRankingItemScores(rankingItemId: string) {
    try {
      return await this.rankingScoreRepository.getRankingScores(rankingItemId);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        'Erro ao buscar as pontuações do ranking 😔',
      );
    }
  }

  async updateRankingScore(rankingScoreId: string, score: number) {
    try {
      const rankingScore =
        await this.rankingScoreRepository.getRankingScoreById(rankingScoreId);

      if (!rankingScore) {
        throw new BadRequestException(
          'Pontuação do item do ranking não encontrada 😔',
        );
      }

      return await this.rankingScoreRepository.updateRankingScore(
        rankingScore.id,
        {
          score,
        },
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        'Não foi possível atualizar a pontuação do item do ranking 😔',
      );
    }
  }
}
