import { BadRequestException, Injectable } from '@nestjs/common';
import CreateRankingItemDto from '../dto/create-ranking-item.dto';
import { RankingValidationsService } from './ranking-validations.service';
import { RankingItemRepository } from '../repositories/ranking-item.repository';
import { RankingScoreRepository } from '../repositories/ranking-score.repository';
import { RankingUserRepository } from '../repositories/ranking-user.repository';
import { ExpoPushService } from 'src/shared/services/expo-push.service';
import UpdateRankingItemDto from '../dto/update-ranking-item.dto';

@Injectable()
export class RankingItemService {
  constructor(
    private readonly rankingItemRepository: RankingItemRepository,
    private readonly rankingItemScoreRepository: RankingScoreRepository,
    private readonly rankingValidationsService: RankingValidationsService,
    private readonly rankingUserRepository: RankingUserRepository,
    private readonly expoPushService: ExpoPushService,
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

      const rankingItemCreated =
        await this.rankingItemRepository.createRankingItem({
          name: createRankingItemDto.name,
          description: createRankingItemDto.description,
          link: createRankingItemDto.link,
          rankingId: createRankingItemDto.rankingId,
          createdById: createRankingItemDto.createdById,
        });

      if (Array.isArray(createRankingItemDto.photos)) {
        await Promise.all(
          createRankingItemDto.photos.map((photo) =>
            this.rankingItemRepository.createRankingItemUserPhoto({
              rankingItemId: rankingItemCreated.id,
              userId: createRankingItemDto.createdById,
              photoId: photo,
            }),
          ),
        );
      }

      // Notify ranking users (excluding creator)
      try {
        const tokens = await this.rankingUserRepository.getRankingUsersPushTokens(
          createRankingItemDto.rankingId,
          createRankingItemDto.createdById,
        );
        if (tokens?.length > 0) {
          await this.expoPushService.sendBulkPushNotifications(
            tokens,
            'Novo item no ranking ✨',
            `${createRankingItemDto.name} foi adicionado ao ranking!`,
          );
        }
      } catch {}

      return rankingItemCreated;
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

      const rankingItems =
        await this.rankingItemRepository.getRankingItems(rankingId);

      return (
        await Promise.all(
          rankingItems.map(async (rankingItem) => {
            return {
              ...rankingItem,
              score:
                (
                  await this.rankingItemScoreRepository.getAvgRankingItemScore(
                    rankingItem.id,
                  )
                ).score || 0,
            };
          }),
        )
      ).sort((a, b) => b?.score - a?.score);
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

  async updateRankingItem(
    rankingId: string,
    rankingItemId: string,
    userId: string,
    updateDto: UpdateRankingItemDto,
  ) {
    try {
      const rankingItem =
        await this.rankingItemRepository.getRankingItemById(rankingItemId);

      if (!rankingItem)
        throw new BadRequestException('Item do ranking não encontrado 😔');

      if (rankingItem.rankingId !== rankingId)
        throw new BadRequestException('Item não pertence a este ranking 😔');

      await this.rankingValidationsService.existRankingUser(
        rankingItem.rankingId,
        userId,
      );

      const updated = await this.rankingItemRepository.updateRankingItem(
        rankingItemId,
        {
          name: updateDto.name,
          description: updateDto.description,
          link: updateDto.link,
          latitude: updateDto.latitude as unknown as number,
          longitude: updateDto.longitude as unknown as number,
        },
      );

      return updated;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro ao atualizar o item do ranking 😔');
    }
  }
}
