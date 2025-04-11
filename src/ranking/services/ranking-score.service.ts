import { BadRequestException, Injectable } from '@nestjs/common';
import { RankingValidationsService } from './ranking-validations.service';
import { RankingScoreRepository } from '../repositories/ranking-score.repository';
import CreateRankingItemScoreDto from '../dto/create-ranking-item-score.dto';

@Injectable()
export class RankingScoreService {
  constructor(
    private readonly rankingScoreRepository: RankingScoreRepository,
    private readonly rankingValidationsService: RankingValidationsService,
  ) {}

  async createRankingScore(createRankingScoreDto: CreateRankingItemScoreDto) {
    try {
      const { rankingItemId, userId, score } = createRankingScoreDto;

      await Promise.all([
        this.rankingValidationsService.existRankingItem(rankingItemId),
        this.rankingValidationsService.existRankingItemScore(
          rankingItemId,
          userId,
        ),
      ]);

      return await this.rankingScoreRepository.createRankingScore({
        userId,
        score,
        rankingItemId,
        rankingCriteriaId: createRankingScoreDto.rankingCriteriaId,
      });
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
