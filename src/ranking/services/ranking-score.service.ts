import { BadRequestException, Injectable } from '@nestjs/common';
import { RankingValidationsService } from './ranking-validations.service';
import { RankingScoreRepository } from '../repositories/ranking-score.repository';
import CreateRankingItemScoreDto from '../dto/create-ranking-item-score.dto';
import CreateMultipleRankingItemScoresDto, { ScoreDto } from '../dto/create-multiple-ranking-item-scores.dto';
import { RankingUserRepository } from '../repositories/ranking-user.repository';
import { ExpoPushService } from 'src/shared/services/expo-push.service';
import { UserRepository } from 'src/user/repositories/user.repository';

type ScoreResult = {
  action: 'created' | 'updated';
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  rankingItemId: string;
  score: number;
  rankingCriteriaId: string;
};

@Injectable()
export class RankingScoreService {
  constructor(
    private readonly rankingScoreRepository: RankingScoreRepository,
    private readonly rankingValidationsService: RankingValidationsService,
    private readonly rankingUserRepository: RankingUserRepository,
    private readonly expoPushService: ExpoPushService,
    private readonly userRepository: UserRepository,
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

  async createMultipleRankingScores(createMultipleScoresDto: CreateMultipleRankingItemScoresDto) {
    try {
      const { rankingItemId, userId, scores } = createMultipleScoresDto;

      // Executar validação e busca do ranking item em paralelo
      const [rankingItem] = await Promise.all([
        this.rankingValidationsService.existRankingItem(rankingItemId),
        this.validateMultipleScoresRequest(rankingItemId, scores),
      ]);
      
      const results = await this.processMultipleScores(rankingItemId, userId, scores);
      
      // Enviar notificação em paralelo com o retorno da resposta
      const [response] = await Promise.all([
        Promise.resolve(this.buildSuccessResponse(results)),
        this.sendEvaluationNotification(rankingItem.rankingId, userId),
      ]);

      return response;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        'Não foi possível criar/atualizar as pontuações do item do ranking 😔',
      );
    }
  }

  private async validateMultipleScoresRequest(rankingItemId: string, scores: ScoreDto[]) {
    const criteriaIds = scores.map(score => score.rankingCriteriaId);
    
    // Validar todos os critérios em paralelo
    await Promise.all(
      criteriaIds.map(criteriaId => 
        this.rankingValidationsService.existRankingCriteria(criteriaId)
      )
    );
  }

  private async processMultipleScores(
    rankingItemId: string, 
    userId: string, 
    scores: ScoreDto[]
  ): Promise<ScoreResult[]> {
    // Separar scores em novos e existentes
    const existingScoresMap = new Map<string, { id: string; score: number }>();
    const newScores: Array<{ rankingCriteriaId: string; score: number }> = [];

    // Verificar quais scores já existem
    for (const scoreData of scores) {
      const existingScore = await this.rankingValidationsService.existRankingItemCriteriaScore(
        rankingItemId,
        userId,
        scoreData.rankingCriteriaId,
      );

      if (existingScore?.id) {
        existingScoresMap.set(scoreData.rankingCriteriaId, {
          id: existingScore.id,
          score: scoreData.score,
        });
      } else {
        newScores.push({
          rankingCriteriaId: scoreData.rankingCriteriaId,
          score: scoreData.score,
        });
      }
    }

    const results: ScoreResult[] = [];

    // Criar novos scores em lote
    if (newScores.length > 0) {
      const createData = newScores.map(score => ({
        userId,
        score: score.score,
        rankingItemId,
        rankingCriteriaId: score.rankingCriteriaId,
      }));

      const createdCount = await this.rankingScoreRepository.createMultipleRankingScores(createData);
      
      // Simular resultados para novos scores (createMany não retorna os objetos criados)
      for (const score of newScores) {
        results.push({
          id: `new-${score.rankingCriteriaId}`, // Placeholder ID
          rankingItemId,
          userId,
          rankingCriteriaId: score.rankingCriteriaId,
          score: score.score,
          createdAt: new Date(),
          updatedAt: new Date(),
          action: 'created',
        });
      }
    }

    // Atualizar scores existentes em lote
    if (existingScoresMap.size > 0) {
      const updates = Array.from(existingScoresMap.values());
      const updatedScores = await this.rankingScoreRepository.updateMultipleRankingScores(updates);
      
      // Adicionar resultados para scores atualizados
      for (const [criteriaId, update] of existingScoresMap) {
        results.push({
          id: update.id,
          rankingItemId,
          userId,
          rankingCriteriaId: criteriaId,
          score: update.score,
          createdAt: new Date(), // Placeholder
          updatedAt: new Date(),
          action: 'updated',
        });
      }
    }

    return results;
  }

  private async processSingleScore(
    rankingItemId: string, 
    userId: string, 
    scoreData: ScoreDto
  ): Promise<ScoreResult> {
    const existingScore = await this.rankingValidationsService.existRankingItemCriteriaScore(
      rankingItemId,
      userId,
      scoreData.rankingCriteriaId,
    );

    if (existingScore?.id) {
      const updated = await this.rankingScoreRepository.updateRankingScore(
        existingScore.id,
        { score: scoreData.score },
      );
      return { ...updated, action: 'updated' as const };
    }

    const created = await this.rankingScoreRepository.createRankingScore({
      userId,
      score: scoreData.score,
      rankingItemId,
      rankingCriteriaId: scoreData.rankingCriteriaId,
    });
    return { ...created, action: 'created' as const };
  }

  private async sendEvaluationNotification(rankingId: string, userId: string) {
    try {
      const tokens = await this.rankingUserRepository.getRankingUsersPushTokens(
        rankingId,
        userId,
      );

      const user = await this.userRepository.findOne({ id: userId });
      
      if (tokens?.length > 0) {
        await this.expoPushService.sendBulkPushNotifications(
          tokens,
          'Item avaliado 📝',
          `Um item do ranking foi avaliado por ${user?.name || 'um usuário'}.`,
        );
      }
    } catch {
      // Silently ignore push notification errors
    }
  }

  private buildSuccessResponse(results: ScoreResult[]) {
    const createdCount = results.filter(r => r.action === 'created').length;
    const updatedCount = results.filter(r => r.action === 'updated').length;

    return {
      message: `${results.length} score(s) processado(s) com sucesso`,
      results,
      summary: {
        created: createdCount,
        updated: updatedCount,
        total: results.length,
      },
    };
  }
}
