import {BadRequestException, Injectable, Logger } from '@nestjs/common';
import {RankingRepository} from "../repositories/ranking.repository";
import CreateRankingItemDto from "../dto/create-ranking-item.dto";
import {RankingValidationsService} from "./ranking-validations.service";

@Injectable()
export class RankingItemService {
    constructor(private readonly rankingRepository: RankingRepository, private readonly rankingValidationsService: RankingValidationsService) {}

    async createRankingItem(createRankingItemDto: CreateRankingItemDto) {
        try {
            await Promise.all([
                this.rankingValidationsService.existUser(createRankingItemDto.createdById),
                this.rankingValidationsService.existRankingUser(createRankingItemDto.rankingId, createRankingItemDto.createdById),
            ]);

            return await this.rankingRepository.createRankingItem({
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
            throw new BadRequestException('Não foi possível criar o item do ranking 😔');
        }
    }

    async getRankingItems(rankingId: string, userId: string) {
        try {
            await Promise.all([
                this.rankingValidationsService.existRanking(rankingId),
                this.rankingValidationsService.existRankingUser(rankingId, userId),
            ]);

            return await this.rankingRepository.getRankingItems(rankingId);
        } catch(error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Erro ao buscar os itens do ranking 😔');
        }
    }

    async deleteRankingItem(rankingItemId: string, userId: string) {
        try {
            const rankingItem = await this.rankingRepository.getRankingItemById(rankingItemId);

            if (!rankingItem) throw new BadRequestException('Item do ranking não encontrado 😔');

            await this.rankingValidationsService.existRankingUser(rankingItem.rankingId, userId);

            await this.rankingRepository.deleteRankingItem(rankingItemId);

            return;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Erro ao deletar o item do ranking 😔');
        }
    }


}
