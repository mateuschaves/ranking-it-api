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
                },
                select: {
                    ranking: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            photo: true,
                            createdAt: true,
                        }
                    }
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

    async createRankingItem(data: Prisma.RankingItemUncheckedCreateInput) {
        try {
            return await this.prismaService.rankingItem.create({
                data
            })
        } catch (error) {
            Logger.error(
                `Error creating ranking item ${error}`,
                'RankingRepository.createRankingItem')
            throw error;
        }
    }

    async createRankingInvite(data: Prisma.RankingInviteUncheckedCreateInput) {
        try {
            return await this.prismaService.rankingInvite.create({
                data
            })
        } catch (error) {
            Logger.error(
                `Error creating ranking invite ${error}`,
                'RankingRepository.createRankingInvite')
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

    async getRankingById(rankingId: string) {
        try {
            return await this.prismaService.ranking.findUnique({
                where: {
                    id: rankingId
                }
            })
        } catch (error) {
            Logger.error(
                `Error fetching ranking by id ${error}`,
                'RankingRepository.getRankingById')
            throw error;
        }
    }

    async getRankingUserById(rankingId: string, userId: string) {
        try {
            return await this.prismaService.ranking.findUnique({
                where: {
                    id: rankingId,
                    userRanking: {
                        some: {
                            userId
                        }
                    }
                }
            })
        } catch (error) {
            Logger.error(
                `Error fetching ranking user by id ${error}`,
                'RankingRepository.getRankingUserById')
            throw error;
        }
    }

    async getRankingItems(rankingId: string) {
        try {
            return await this.prismaService.rankingItem.findMany({
                where: {
                    rankingId
                },
                omit: {
                    rankingId: true,
                    createdById: true,
                },
                include: {
                    createdByUser: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        }
                    }
                }
            })
        } catch (error) {
            Logger.error(
                `Error fetching ranking items ${error}`,
                'RankingRepository.getRankingItems')
            throw error;
        }
    }

    async getRankingItemById(rankingItemId: string) {
        try {
            return await this.prismaService.rankingItem.findUnique({
                where: {
                    id: rankingItemId
                }
            })
        } catch (error) {
            Logger.error(
                `Error fetching ranking item by id ${error}`,
                'RankingRepository.getRankingItemById')
            throw error;
        }
    }


    async deleteRankingItem(rankingItemId: string) {
        try {
            return await this.prismaService.rankingItem.delete({
                where: {
                    id: rankingItemId
                }
            })
        } catch (error) {
            Logger.error(
                `Error deleting ranking item ${error}`,
                'RankingRepository.deleteRankingItem')
            throw error;
        }
    }
}