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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { RankingScoreService } from '../services/ranking-score.service';
import CreateRankingItemScoreDto from '../dto/create-ranking-item-score.dto';
import { GetUser } from 'src/user/decorators/get-current-user.decorator';

@ApiTags('Ranking Scores')
@ApiBearerAuth('JWT-auth')
@Controller('rankings')
@UseGuards(AuthGuard('jwt'))
export class RankingScoreController {
  constructor(private readonly rankingItemScoreService: RankingScoreService) {}

  @Post(':rankingId/items/:rankingItemId/scores')
  @ApiOperation({ summary: 'Create a new score for a ranking item' })
  @ApiParam({ name: 'rankingId', description: 'ID of the ranking' })
  @ApiParam({ name: 'rankingItemId', description: 'ID of the ranking item' })
  @ApiBody({
    description: 'Payload to create/update a score for an item criterion',
    schema: {
      type: 'object',
      properties: {
        rankingCriteriaId: { type: 'string', example: 'criteria-123' },
        score: { type: 'number', minimum: 0, maximum: 10, example: 8 },
      },
      required: ['rankingCriteriaId', 'score'],
      example: {
        rankingCriteriaId: 'criteria-123',
        score: 8,
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Score created successfully',
    schema: {
      properties: {
        id: { type: 'string', example: 'score-123' },
        score: { type: 'number', example: 8 },
        rankingItemId: { type: 'string', example: 'item-123' },
        rankingCriteriaId: { type: 'string', example: 'criteria-123' },
        userId: { type: 'string', example: 'user-123' },
        createdAt: { type: 'string', format: 'date-time', example: '2024-07-01T12:00:00.000Z' },
      },
      example: {
        id: 'score-123',
        score: 8,
        rankingItemId: 'item-123',
        rankingCriteriaId: 'criteria-123',
        userId: 'user-123',
        createdAt: '2024-07-01T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
    schema: { example: { message: 'Erro de validação' } },
  })
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
  @ApiOperation({ summary: 'Get all scores for a specific ranking item' })
  @ApiParam({ name: 'rankingId', description: 'ID of the ranking' })
  @ApiParam({ name: 'rankingItemId', description: 'ID of the ranking item' })
  @ApiResponse({
    status: 200,
    description: 'Ranking scores retrieved successfully',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'string', example: 'score-123' },
          score: { type: 'number', example: 8 },
          rankingItemId: { type: 'string', example: 'item-123' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'user-123' },
              name: { type: 'string', example: 'John Doe' },
              avatar: {
                type: 'object',
                properties: {
                  url: { type: 'string', example: 'http://ranking-attachments.s3.us-east-1.amazonaws.com/avatar.jpg' },
                },
              },
            },
          },
          rankingCriteria: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'criteria-123' },
              name: { type: 'string', example: 'Qualidade' },
            },
          },
        },
      },
      example: [
        {
          id: 'score-123',
          score: 8,
          rankingItemId: 'item-123',
          user: {
            id: 'user-123',
            name: 'John Doe',
            avatar: {
              url: 'http://ranking-attachments.s3.us-east-1.amazonaws.com/avatar.jpg',
            },
          },
          rankingCriteria: {
            id: 'criteria-123',
            name: 'Qualidade',
          },
        },
      ],
    },
  })
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
