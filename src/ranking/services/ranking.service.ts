import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { RankingRepository } from '../repositories/ranking.repository';
import CreateRankingDto from '../dto/create-ranking.dto';
import { RankingValidationsService } from './ranking-validations.service';
import { BucketService } from 'src/shared/services/bucket.service';
import UpdateRankingDto from '../dto/update-ranking.dto';

@Injectable()
export class RankingService {
  constructor(
    private readonly rankingRepository: RankingRepository,
    private readonly rankingValidationService: RankingValidationsService,
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
}
