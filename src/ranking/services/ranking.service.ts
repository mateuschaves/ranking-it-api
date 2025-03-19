import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import {RankingRepository} from "../repositories/ranking.repository";
import CreateRankingDto from "../dto/create-ranking.dto";
import {RankingValidationsService} from "./ranking-validations.service";

@Injectable()
export class RankingService {
    constructor(
        private readonly rankingRepository: RankingRepository,
        private readonly rankingValidationService: RankingValidationsService
    ) {}

    async createRanking(createRankingDto: CreateRankingDto) {
        try {
            Logger.log('Validate exist user', 'RankingService.createRanking')
            const owner = await this.rankingValidationService.existUser(createRankingDto.ownerId);


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
}
