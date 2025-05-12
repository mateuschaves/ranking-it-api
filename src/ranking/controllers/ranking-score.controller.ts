import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RankingScoreService } from '../services/ranking-score.service';
import CreateRankingItemScoreDto from '../dto/create-ranking-item-score.dto';
import { GetUser } from 'src/user/decorators/get-current-user.decorator';

@Controller('rankings')
@UseGuards(AuthGuard('jwt'))
export class RankingScoreController {
  constructor(private readonly rankingItemScoreService: RankingScoreService) {}

  @Post(':rankingId/items/:rankingItemId/scores')
  async createRankingScore(
    @Param('rankingId') rankingId: string,
    @Param('rankingItemId') rankingItemId: string,
    @Body() createRankingScoreDto: CreateRankingItemScoreDto,
    @GetUser() userId: string,
  ) {
    Logger.log('Request', {
      rankingId,
      rankingItemId,
      createRankingScoreDto,
      userId,
    });

    Logger.log('Creating ranking score', RankingScoreController.name);
    createRankingScoreDto.rankingItemId = rankingItemId;
    createRankingScoreDto.userId = userId;

    return await this.rankingItemScoreService.createRankingScore(
      createRankingScoreDto,
    );
  }

  @Get(':rankingId/items/:rankingItemId/scores')
  async getRankingScores(
    @Param('rankingId') rankingId: string,
    @Param('rankingItemId') rankingItemId: string,
  ) {
    Logger.log('Request', {
      rankingId,
      rankingItemId,
    });

    Logger.log('Getting ranking scores', RankingScoreController.name);
    return await this.rankingItemScoreService.getRankingItemScores(
      rankingItemId,
    );
  }
}
