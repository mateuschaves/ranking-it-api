import {BadRequestException, Injectable } from '@nestjs/common';
import {RankingRepository} from "../repositories/ranking.repository";
import {UserRepository} from "../../user/repositories/user.repository";

@Injectable()
export class RankingValidationsService {
    constructor(private readonly rankingRepository: RankingRepository, private readonly userRepository: UserRepository) {}

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
