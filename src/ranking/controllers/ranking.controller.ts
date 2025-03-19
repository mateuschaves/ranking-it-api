import {Body, Controller, Delete, Get, Logger, Param, Post, UseGuards} from '@nestjs/common';
import {RankingService} from "../services/ranking.service";
import CreateRankingDto from "../dto/create-ranking.dto";
import {AuthGuard} from "@nestjs/passport";
import {GetUser} from "../../user/decorators/get-current-user.decorator";
import CreateRankingItemDto from "../dto/create-ranking-item.dto";

@Controller('rankings')
@UseGuards(AuthGuard('jwt'))
export class RankingController {
    constructor( private readonly rankingService: RankingService) {
    }

    @Post('')
    async createRanking(@Body() createRankingDto: CreateRankingDto, @GetUser() userId: string) {

        createRankingDto.ownerId = userId;

        Logger.log(
            `Creating ranking for user ${JSON.stringify(userId)}`,
            RankingController.name)
        return await this.rankingService.createRanking(createRankingDto);
    }

    @Get('')
    async getAllRankings(@GetUser() userId: string) {
        Logger.log(
            `Getting all rankings for user ${JSON.stringify(userId)}`,
            RankingController.name)
        return await this.rankingService.getAllRankingsByUserId(userId);
    }

    @Post(':rankingId/items')
    async createRankingItem(@Param('rankingId') rankingId: string, @Body() createRankingItemDto: CreateRankingItemDto, @GetUser() userId: string) {
        Logger.log('Request', {
            rankingId,
            createRankingItemDto,
            userId
        })

        Logger.log('Creating ranking item', RankingController.name)
        createRankingItemDto.createdById = userId;
        createRankingItemDto.rankingId = rankingId;

        return await this.rankingService.createRankingItem(createRankingItemDto);
    }

    @Get(':rankingId/items')
    async getRankingItems(@Param('rankingId') rankingId: string, @GetUser() userId: string) {
        Logger.log('Request', {
            rankingId,
            userId
        })

        Logger.log('Getting ranking items', RankingController.name)
        return await this.rankingService.getRankingItems(rankingId, userId);
    }

    @Delete(':rankingId/items/:rankingItemId')
    async deleteRankingItem(@Param('rankingId') rankingId: string, @Param('rankingItemId') rankingItemId: string, @GetUser() userId: string) {
        Logger.log('Request', {
            rankingId,
            rankingItemId,
            userId
        })

        Logger.log('Deleting ranking item', RankingController.name)
        await this.rankingService.deleteRankingItem(rankingItemId, userId);
    }
}
