import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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
          createdBy: ranking.owner,
        };
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('Erro ao buscar os rankings 😔');
    }
  }

  async getRankingDetails(rankingId: string, userId: string) {
    try {
      Logger.log(
        `Getting ranking details for ranking ${rankingId} and user ${userId}`,
        'RankingUserService.getRankingDetails',
      );

      // Validar se o ranking existe
      await this.rankingValidationService.existRanking(rankingId);
      
      // Validar se o usuário é membro do ranking
      await this.rankingValidationService.existRankingUser(rankingId, userId);

      const rankingDetails = await this.rankingUserRepository.getRankingDetails(rankingId);

      if (!rankingDetails) {
        throw new BadRequestException('Ranking não encontrado 😔');
      }

      return rankingDetails;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      Logger.error(
        `Error getting ranking details ${error}`,
        'RankingUserService.getRankingDetails',
      );
      throw new BadRequestException('Erro ao buscar detalhes do ranking 😔');
    }
  }

  async removeMemberFromRanking(rankingId: string, memberId: string, adminId: string) {
    try {
      Logger.log(
        `Removing member ${memberId} from ranking ${rankingId} by admin ${adminId}`,
        'RankingUserService.removeMemberFromRanking',
      );

      // Validar se o ranking existe
      await this.rankingValidationService.existRanking(rankingId);
      
      // Validar se o admin é o proprietário do ranking
      const isOwner = await this.rankingUserRepository.isRankingOwner(rankingId, adminId);
      if (!isOwner) {
        throw new BadRequestException('Apenas o proprietário do ranking pode remover membros 😔');
      }

      // Validar se o membro existe no ranking
      await this.rankingValidationService.existRankingUser(rankingId, memberId);

      // Não permitir que o admin remova a si mesmo
      if (adminId === memberId) {
        throw new BadRequestException('Você não pode remover a si mesmo do ranking 😔');
      }

      // Remover o usuário do ranking
      const result = await this.rankingUserRepository.removeUserFromRanking(rankingId, memberId);

      if (result.count === 0) {
        throw new BadRequestException('Usuário não encontrado no ranking 😔');
      }

      Logger.log(
        `Successfully removed member ${memberId} from ranking ${rankingId}`,
        'RankingUserService.removeMemberFromRanking',
      );

      return {
        message: 'Membro removido com sucesso do ranking',
        removedUserId: memberId,
        rankingId,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      Logger.error(
        `Error removing member from ranking ${error}`,
        'RankingUserService.removeMemberFromRanking',
      );
      throw new BadRequestException('Erro ao remover membro do ranking 😔');
    }
  }
}
