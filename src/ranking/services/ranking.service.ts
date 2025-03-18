import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import {RankingRepository} from "../repositories/ranking.repository";
import {UserRepository} from "../../user/repositories/user.repository";
import CreateRankingDto from "../dto/create-ranking.dto";

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
}
