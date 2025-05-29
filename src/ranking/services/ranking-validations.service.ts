import { BadRequestException, Injectable } from '@nestjs/common';
import { RankingRepository } from '../repositories/ranking.repository';
import { RankingUserRepository } from '../repositories/ranking-user.repository';
import { UserRepository } from 'src/user/repositories/user.repository';
import { RankingItemRepository } from '../repositories/ranking-item.repository';
import { RankingScoreRepository } from '../repositories/ranking-score.repository';

@Injectable()
export class RankingValidationsService {
  constructor(
    private readonly rankingRepository: RankingRepository,
    private readonly rankingUserRepository: RankingUserRepository,
    private readonly rankingItemRepository: RankingItemRepository,
    private readonly rankingScoreRepository: RankingScoreRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async existUser(userId: string) {
    if (!userId)
      throw new BadRequestException(
        'Você não tem permissão para acessar esse recurso 😳',
      );

    const existUser = await this.userRepository.findOne({
      id: userId,
    });

    if (!existUser)
      throw new BadRequestException(
        'Você não tem permissão para acessar esse recurso 😳',
      );

    return existUser;
  }

  async existRanking(id: string) {
    if (!id) throw new BadRequestException('Ranking não encontrado 😔');

    const existRanking = await this.rankingRepository.getRankingById(id);

    if (!existRanking)
      throw new BadRequestException('Ranking não encontrado 😔');

    return existRanking;
  }

  async existRankingUser(rankingId: string, userId: string) {
    if (!rankingId || !userId)
      throw new BadRequestException(
        'Você não tem permissão para acessar esse recurso 😳',
      );

    const existRankingUser =
      await this.rankingUserRepository.getRankingUserById(rankingId, userId);

    if (!existRankingUser)
      throw new BadRequestException(
        'Você não tem permissão para acessar esse recurso 😳',
      );

    return existRankingUser;
  }

  async existRankingItem(rankingItemId: string) {
    if (!rankingItemId)
      throw new BadRequestException('Item do ranking não encontrado 😔');

    const existRankingItem =
      await this.rankingItemRepository.getRankingItemById(rankingItemId);

    if (!existRankingItem)
      throw new BadRequestException('Item do ranking não encontrado 😔');

    return existRankingItem;
  }

  async existRankingItemScore(rankingItemId: string, userId: string) {
    if (!rankingItemId || !userId)
      throw new BadRequestException(
        'Você não tem permissão para acessar esse recurso 😳',
      );

    const existRankingItemScore =
      await this.rankingScoreRepository.getRankingScoreByItemId(rankingItemId);

    const alreadyVoted = existRankingItemScore.some(
      (rankingScore) => rankingScore.userId === userId,
    );

    if (alreadyVoted)
      throw new BadRequestException('Você já votou nesse item 😳');

    if (!existRankingItemScore)
      throw new BadRequestException(
        'Você não tem permissão para acessar esse recurso 😳',
      );

    return existRankingItemScore;
  }

  async existRankingItemCriteriaScore(
    rankingItemId: string,
    userId: string,
    rankingCriteriaId: string,
  ) {
    if (!rankingItemId || !userId)
      throw new BadRequestException(
        'Você não tem permissão para acessar esse recurso 😳',
      );

    const existRankingItemCriteriaScore =
      await this.rankingScoreRepository.getRankingScoreCriteriaByUserId(
        rankingItemId,
        rankingCriteriaId,
        userId,
      );

    return existRankingItemCriteriaScore;
  }

  async existRankingCriteria(rankingCriteriaId: string) {
    if (!rankingCriteriaId)
      throw new BadRequestException('Critério de ranking não encontrado 😔');

    const existRankingCriteria =
      await this.rankingScoreRepository.getRankingCriteriaById(
        rankingCriteriaId,
      );

    if (!existRankingCriteria)
      throw new BadRequestException('Critério de ranking não encontrado 😔');

    return existRankingCriteria;
  }
}
