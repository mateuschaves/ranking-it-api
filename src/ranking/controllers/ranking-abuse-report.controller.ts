import {
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RankingAbuseReportService } from '../services/ranking-abuse-report.service';
import { CreateAbuseReportDto } from '../dto/create-abuse-report.dto';
import { GetUser } from 'src/user/decorators/get-current-user.decorator';

@ApiTags('Ranking Abuse Reports')
@ApiBearerAuth('JWT-auth')
@Controller('rankings')
@UseGuards(AuthGuard('jwt'))
export class RankingAbuseReportController {
  constructor(
    private readonly rankingAbuseReportService: RankingAbuseReportService,
  ) {}

  @Post(':rankingId/report')
  @ApiOperation({ summary: 'Reportar abuso em um ranking' })
  @ApiParam({ name: 'rankingId', description: 'ID do ranking a ser denunciado' })
  @ApiBody({
    type: CreateAbuseReportDto,
    description: 'Informações da denúncia',
  })
  @ApiResponse({
    status: 201,
    description: 'Denúncia registrada com sucesso',
  })
  async reportRanking(
    @Param('rankingId') rankingId: string,
    @GetUser() userId: string,
    @Body() payload: CreateAbuseReportDto,
  ) {
    return this.rankingAbuseReportService.reportRanking(
      rankingId,
      userId,
      payload.description,
    );
  }

  @Post(':rankingId/items/:rankingItemId/report')
  @ApiOperation({ summary: 'Reportar abuso em um item do ranking' })
  @ApiParam({ name: 'rankingId', description: 'ID do ranking' })
  @ApiParam({ name: 'rankingItemId', description: 'ID do item do ranking' })
  @ApiBody({
    type: CreateAbuseReportDto,
    description: 'Informações da denúncia',
  })
  @ApiResponse({
    status: 201,
    description: 'Denúncia registrada com sucesso',
  })
  async reportRankingItem(
    @Param('rankingId') rankingId: string,
    @Param('rankingItemId') rankingItemId: string,
    @GetUser() userId: string,
    @Body() payload: CreateAbuseReportDto,
  ) {
    return this.rankingAbuseReportService.reportRankingItem(
      rankingId,
      rankingItemId,
      userId,
      payload.description,
    );
  }
}

