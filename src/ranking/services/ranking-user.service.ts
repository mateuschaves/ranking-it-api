import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import {RankingRepository} from "../repositories/ranking.repository";
import {RankingValidationsService} from "./ranking-validations.service";

@Injectable()
export class RankingUserService {
    constructor(
        private readonly rankingRepository: RankingRepository,
        private readonly rankingValidationService: RankingValidationsService
    ) {}

    async getAllRankingsByUserId(userId: string) {
        try {
            await this.rankingValidationService.existUser(userId);

            return await this.rankingRepository.getAllRankingsByUserId(userId);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new BadRequestException('Erro ao buscar os rankings 😔');
        }
    }
}
