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
          banner: ranking?.banner?.name
            ? `${process.env.AWS_S3_ENDPOINT}/${ranking?.banner?.name}`
            : null,
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
