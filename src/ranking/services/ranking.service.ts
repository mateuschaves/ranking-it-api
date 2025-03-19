import {BadRequestException, Injectable, Logger } from '@nestjs/common';
import {RankingRepository} from "../repositories/ranking.repository";
import {UserRepository} from "../../user/repositories/user.repository";
import CreateRankingDto from "../dto/create-ranking.dto";
import CreateRankingItemDto from "../dto/create-ranking-item.dto";

@Injectable()
export class RankingService {
    constructor(private readonly rankingRepository: RankingRepository, private readonly userRepository: UserRepository) {}

    async getAllRankingsByUserId(userId: string) {
        try {
            await this.existUser(userId);

            return await this.rankingRepository.getAllRankingsByUserId(userId);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new BadRequestException('Erro ao buscar os rankings 😔');
        }
    }

    async createRanking(createRankingDto: CreateRankingDto) {
        try {
            Logger.log('Validate exist user', 'RankingService.createRanking')
            const owner = await this.existUser(createRankingDto.ownerId);


            Logger.log('Create ranking', 'RankingService.createRanking')
            return await this.rankingRepository.createRanking({
                name: createRankingDto.name,
                ownerId: owner.id,
                description: createRankingDto.description,
                photo: createRankingDto.photo,
            });
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new BadRequestException('Erro ao criar ranking ☹️');
        }
    }

    async createRankingItem(createRankingItemDto: CreateRankingItemDto) {
        try {
            await Promise.all([
                this.existUser(createRankingItemDto.createdById),
                this.existRankingUser(createRankingItemDto.rankingId, createRankingItemDto.createdById),
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
                this.existRanking(rankingId),
                this.existRankingUser(rankingId, userId),
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

            await this.existRankingUser(rankingItem.rankingId, userId);

            await this.rankingRepository.deleteRankingItem(rankingItemId);
            
            return;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Erro ao deletar o item do ranking 😔');
        }
    }

    async updateRanking(rankingId: string, data) {
        return await this.rankingRepository.updateRanking(rankingId, data);
    }


    async existUser(userId: string) {
        if (!userId) throw new BadRequestException('Você não tem permissão para acessar esse recurso 😳');

        const existUser = await this.userRepository.findOne({
            id: userId,
        })

        if(!existUser) throw new BadRequestException('Você não tem permissão para acessar esse recurso 😳');

        return existUser;
    }

    async existRanking(id: string) {
        if (!id) throw new BadRequestException('Ranking não encontrado 😔');

        const existRanking = await this.rankingRepository.getRankingById(id)

        if(!existRanking) throw new BadRequestException('Ranking não encontrado 😔');

        return existRanking
    }

    async existRankingUser(rankingId: string, userId: string) {
        if (!rankingId || !userId) throw new BadRequestException('Você não tem permissão para acessar esse recurso 😳');

        const existRankingUser = await this.rankingRepository.getRankingUserById(rankingId, userId)

        if(!existRankingUser) throw new BadRequestException('Você não tem permissão para acessar esse recurso 😳');

        return existRankingUser
    }
}
