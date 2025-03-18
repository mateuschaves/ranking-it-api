import {Injectable, Logger} from "@nestjs/common";
import {PrismaService} from "src/shared/services/prisma.service";
import {Prisma} from "@prisma/client";

@Injectable()
export class RankingRepository {
    constructor(private readonly prismaService: PrismaService) {}

    async getAllRankingsByUserId(userId: string) {
        try {
            return await this.prismaService.userRanking.findMany({
                where: {
                    userId,
                }
            });
        } catch (error) {
            Logger.error(
                `Error fetching all rankings by user id ${error}`,
                'RankingRepository.getAllRankingsByUserId')
            throw error;
        }
    }

    async createRanking(data: Prisma.RankingUncheckedCreateInput) {
        try {
            Logger.log('Creating ranking', 'RankingRepository.createRanking')
            const ranking = await this.prismaService.ranking.create({
                data,
            })

            Logger.log('Creating user ranking', 'RankingRepository.createRanking')
            await this.prismaService.userRanking.create({
                data: {
                    userId: ranking.ownerId,
                    rankingId: ranking.id,
                }
            });

            return ranking;
        } catch (error) {
            Logger.error(
                `Error creating ranking ${error}`,
                'RankingRepository.createRanking')
            throw error;
        }
    }

    async updateRanking(rankingId: string, data: Prisma.RankingUpdateInput) {
        try {
            return await this.prismaService.ranking.update({
                where: {
                    id: rankingId
                },
                data
            })
        } catch (error) {
            Logger.error(
                `Error updating ranking ${error}`,
                'RankingRepository.updateRanking')
            throw error;
        }
    }

}