import { BadRequestException, Injectable } from '@nestjs/common';
import { RankingValidationsService } from './ranking-validations.service';
import { RankingUserRepository } from '../repositories/ranking-user.repository';

@Injectable()
export class RankingUserService {
  constructor(
    private readonly rankingUserRepository: RankingUserRepository,
    private readonly rankingValidationService: RankingValidationsService,
  ) {}

  async getAllRankingsByUserId(userId: string) {
    try {
      await this.rankingValidationService.existUser(userId);

      const rankings =
        await this.rankingUserRepository.getAllRankingsByUserId(userId);
      return rankings.map((ranking) => {
        return {
          ...ranking,
        };
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('Erro ao buscar os rankings 😔');
    }
  }
}
