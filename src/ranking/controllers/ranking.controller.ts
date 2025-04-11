import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RankingService } from '../services/ranking.service';
import CreateRankingDto from '../dto/create-ranking.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../../user/decorators/get-current-user.decorator';
import { RankingUserService } from '../services/ranking-user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import UpdateRankingDto from '../dto/update-ranking.dto';
import CreateRankingCriteriaDto from '../dto/create-ranking-criteria.dto';

@Controller('rankings')
@UseGuards(AuthGuard('jwt'))
export class RankingController {
  constructor(
    private readonly rankingService: RankingService,
    private readonly rankingUserService: RankingUserService,
  ) {}

  @Post('')
  @UseInterceptors(FileInterceptor('photo'))
  async createRanking(
    @Body() createRankingDto: CreateRankingDto,
    @GetUser() userId: string,
  ) {
    createRankingDto.ownerId = userId;

    Logger.log(
      `Creating ranking for user ${JSON.stringify(userId)}`,
      RankingController.name,
    );
    return await this.rankingService.createRanking(createRankingDto);
  }

  @Get('')
  async getAllRankings(@GetUser() userId: string) {
    Logger.log(
      `Getting all rankings for user ${JSON.stringify(userId)}`,
      RankingController.name,
    );
    return await this.rankingUserService.getAllRankingsByUserId(userId);
  }

  @Put(':rankingId')
  async updateRanking(
    @Body() updateRankingDto: UpdateRankingDto,
    @Param('rankingId') rankingId: string,
  ) {
    Logger.log(
      `Updating ranking ${JSON.stringify(updateRankingDto)}`,
      RankingController.name,
    );
    return await this.rankingService.updateRanking(rankingId, updateRankingDto);
  }

  @Get(':rankingId/suggest-criteria')
  async suggestRankingCriteria(
    @Param('rankingId') rankingId: string,
    @GetUser() userId: string,
  ) {
    Logger.log(
      `Suggesting ranking criteria for ranking ${JSON.stringify(rankingId)}`,
      RankingController.name,
    );
    return await this.rankingService.suggestRankingCriteria(rankingId, userId);
  }

  @Get(':rankingId/criteria')
  async getRankingCriteria(@Param('rankingId') rankingId: string) {
    Logger.log(
      `Getting ranking criteria for ranking ${JSON.stringify(rankingId)}`,
      RankingController.name,
    );
    return await this.rankingService.getRankingCriteria(rankingId);
  }

  @Post(':rankingId/criteria')
  async createRankingCriteria(
    @Param('rankingId') rankingId: string,
    @Body() createRankingCriteriaDto: CreateRankingCriteriaDto,
    @GetUser() userId: string,
  ) {
    Logger.log(
      `Creating ranking criteria for ranking ${JSON.stringify(rankingId)}`,
      RankingController.name,
    );
    return await this.rankingService.createRankingCriteria(
      rankingId,
      createRankingCriteriaDto.criteria,
      userId,
      );
  }

  @Delete(':rankingId/criteria/:criteriaId')
  async removeRankingCriteria(
    @Param('rankingId') rankingId: string,
    @Param('criteriaId') criteriaId: string,
    @GetUser() userId: string,
  ) {
    Logger.log(
      `Removing ranking criteria for ranking ${JSON.stringify(rankingId)}`,
      RankingController.name,
    );
    return await this.rankingService.removeRankingCriteria(rankingId, criteriaId, userId);
  }
}
