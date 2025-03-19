import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import CreateRankingItemDto from '../dto/create-ranking-item.dto';
import { RankingValidationsService } from './ranking-validations.service';
import { RankingItemRepository } from '../repositories/ranking-item.repository';
import {RankingScoreRepository} from "../repositories/ranking-score.repository";

@Injectable()
export class RankingItemService {
  constructor(
    private readonly rankingItemRepository: RankingItemRepository,
    private readonly rankingItemScoreRepository: RankingScoreRepository,
    private readonly rankingValidationsService: RankingValidationsService,
  ) {}

  async createRankingItem(createRankingItemDto: CreateRankingItemDto) {
    try {
      await Promise.all([
        this.rankingValidationsService.existUser(
          createRankingItemDto.createdById,
        ),
        this.rankingValidationsService.existRankingUser(
          createRankingItemDto.rankingId,
          createRankingItemDto.createdById,
        ),
      ]);

      return await this.rankingItemRepository.createRankingItem({
        name: createRankingItemDto.name,
        description: createRankingItemDto.description,
        photo: createRankingItemDto.photo,
        link: createRankingItemDto.link,
        rankingId: createRankingItemDto.rankingId,
        createdById: createRankingItemDto.createdById,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Não foi possível criar o item do ranking 😔',
      );
    }
  }

  async getRankingItems(rankingId: string, userId: string) {
    try {
      await Promise.all([
        this.rankingValidationsService.existRanking(rankingId),
        this.rankingValidationsService.existRankingUser(rankingId, userId),
      ]);

      const rankingItems = await this.rankingItemRepository.getRankingItems(rankingId);

      return (await Promise.all(rankingItems.map(async rankingItem => {
        return {
          ...rankingItem,
          score: (await this.rankingItemScoreRepository.getAvgRankingItemScore(rankingItem.id)).score || 0,
        }
      }))).sort((a, b) => b?.score - a?.score);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro ao buscar os itens do ranking 😔');
    }
  }

  async deleteRankingItem(rankingItemId: string, userId: string) {
    try {
      const rankingItem =
        await this.rankingItemRepository.getRankingItemById(rankingItemId);

      if (!rankingItem)
        throw new BadRequestException('Item do ranking não encontrado 😔');

      await this.rankingValidationsService.existRankingUser(
        rankingItem.rankingId,
        userId,
      );

      await this.rankingItemRepository.deleteRankingItem(rankingItemId);

      return;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro ao deletar o item do ranking 😔');
    }
  }
}
