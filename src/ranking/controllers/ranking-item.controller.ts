import {Body, Controller, Delete, Get, Logger, Param, Post, UseGuards} from '@nestjs/common';
import {AuthGuard} from "@nestjs/passport";
import {GetUser} from "../../user/decorators/get-current-user.decorator";
import CreateRankingItemDto from "../dto/create-ranking-item.dto";
import {RankingItemService} from "../services/ranking-item.service";

@Controller('rankings')
@UseGuards(AuthGuard('jwt'))
export class RankingItemController {
    constructor(
        private readonly rankingItemService: RankingItemService
    ) {}

    @Post(':rankingId/items')
    async createRankingItem(@Param('rankingId') rankingId: string, @Body() createRankingItemDto: CreateRankingItemDto, @GetUser() userId: string) {
        Logger.log('Request', {
            rankingId,
            createRankingItemDto,
            userId
        })

        Logger.log('Creating ranking item', RankingItemController.name)
        createRankingItemDto.createdById = userId;
        createRankingItemDto.rankingId = rankingId;

        return await this.rankingItemService.createRankingItem(createRankingItemDto);
    }

    @Get(':rankingId/items')
    async getRankingItems(@Param('rankingId') rankingId: string, @GetUser() userId: string) {
        Logger.log('Request', {
            rankingId,
            userId
        })

        Logger.log('Getting ranking items', RankingItemController.name)
        return await this.rankingItemService.getRankingItems(rankingId, userId);
    }

    @Delete(':rankingId/items/:rankingItemId')
    async deleteRankingItem(@Param('rankingId') rankingId: string, @Param('rankingItemId') rankingItemId: string, @GetUser() userId: string) {
        Logger.log('Request', {
            rankingId,
            rankingItemId,
            userId
        })

        Logger.log('Deleting ranking item', RankingItemController.name)
        await this.rankingItemService.deleteRankingItem(rankingItemId, userId);
    }
}
