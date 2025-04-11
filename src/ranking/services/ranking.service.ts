import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { RankingRepository } from '../repositories/ranking.repository';
import CreateRankingDto from '../dto/create-ranking.dto';
import { RankingValidationsService } from './ranking-validations.service';
import { BucketService } from 'src/shared/services/bucket.service';
import UpdateRankingDto from '../dto/update-ranking.dto';
import { OpenAiService } from '../../ai/services/openai.service';

@Injectable()
export class RankingService {
  constructor(
    private readonly rankingRepository: RankingRepository,
    private readonly rankingValidationService: RankingValidationsService,
    private readonly OpenAiService: OpenAiService,
    private readonly bucketService: BucketService,
  ) {}

  async createRanking(createRankingDto: CreateRankingDto) {
    try {
      Logger.log('Validate exist user', 'RankingService.createRanking');
      const owner = await this.rankingValidationService.existUser(
        createRankingDto.ownerId,
      );

      Logger.log('Create ranking', 'RankingService.createRanking');
      return await this.rankingRepository.createRanking({
        name: createRankingDto.name,
        ownerId: owner.id,
        description: createRankingDto.description,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('Erro ao criar ranking ☹️');
    }
  }

  async updateRanking(rankingId: string, data: UpdateRankingDto) {
    try {
      Logger.log('Validate exist ranking', 'RankingService.updateRanking');
      await this.rankingValidationService.existRanking(rankingId);
      await this.rankingRepository.updateRanking(rankingId, data);
      Logger.log('Ranking updated', 'RankingService.updateRanking');
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro ao atualizar ranking ☹️');
    }
  }

  async suggestRankingCriteria(rankingId: string) {
    try {
      Logger.log(
        'Validate exist ranking',
        'RankingService.suggestRankingCriteria',
      );
      const ranking =
        await this.rankingValidationService.existRanking(rankingId);

      const prompt = `Sugira critérios de avaliação para o ranking ${ranking.name}`;

      const aiResponse = await this.OpenAiService.createCompletion(prompt);

      Logger.log(
        `AI response: ${JSON.stringify(aiResponse?.choices[0]?.message?.content)}`,
        'RankingService.suggestRankingCriteria',
      );

      if (
        !aiResponse ||
        !Array.isArray(aiResponse.choices) ||
        !aiResponse.choices[0]
      ) {
        throw new BadRequestException('Invalid AI response');
      }

      const criterias = (aiResponse.choices[0].message.content as unknown as string) || '[]';

      const parsedCriteria = JSON.parse(criterias);

      return {
        criteria: parsedCriteria,
        rankingId,
        rankingName: ranking.name,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      Logger.error(
        error,
        'RankingService.suggestRankingCriteria',
        'Error suggesting ranking criteria',
      );
      throw new BadRequestException('Erro ao sugerir critérios ☹️');
    }
  }
}
