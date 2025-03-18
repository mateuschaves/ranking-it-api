import {Body, Controller, Logger, Post, UseGuards} from '@nestjs/common';
import {RankingService} from "../services/ranking.service";
import CreateRankingDto from "../dto/create-ranking.dto";
import {JwtAuthGuard} from "src/user/guards/JwtAuth.guard";
import {AuthGuard} from "@nestjs/passport";
import {GetUser} from "../../user/decorators/get-current-user.decorator";

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
}
