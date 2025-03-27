import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RankingService } from '../services/ranking.service';
import CreateRankingDto from '../dto/create-ranking.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../../user/decorators/get-current-user.decorator';
import { RankingUserService } from '../services/ranking-user.service';
import { FileInterceptor } from '@nestjs/platform-express';

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
    @UploadedFile() file: Express.Multer.File,
  ) {
    createRankingDto.ownerId = userId;

    Logger.log(
      `Creating ranking for user ${JSON.stringify(userId)}`,
      RankingController.name,
    );
    return await this.rankingService.createRanking(createRankingDto, file);
  }

  @Get('')
  async getAllRankings(@GetUser() userId: string) {
    Logger.log(
      `Getting all rankings for user ${JSON.stringify(userId)}`,
      RankingController.name,
    );
    return await this.rankingUserService.getAllRankingsByUserId(userId);
  }
}
