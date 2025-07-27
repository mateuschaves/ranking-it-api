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
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { RankingService } from '../services/ranking.service';
import CreateRankingDto from '../dto/create-ranking.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../../user/decorators/get-current-user.decorator';
import { RankingUserService } from '../services/ranking-user.service';
import { RankingInviteService } from '../services/ranking-invite.service';
import { FileInterceptor } from '@nestjs/platform-express';
import UpdateRankingDto from '../dto/update-ranking.dto';
import CreateRankingCriteriaDto from '../dto/create-ranking-criteria.dto';
import { CreateRankingInviteDto } from '../dto/create-ranking-invite.dto';

@ApiTags('Rankings')
@ApiBearerAuth('JWT-auth')
@Controller('rankings')
@UseGuards(AuthGuard('jwt'))
export class RankingController {
  constructor(
    private readonly rankingService: RankingService,
    private readonly rankingUserService: RankingUserService,
    private readonly rankingInviteService: RankingInviteService,
  ) {}

  @Post('')
  @UseInterceptors(FileInterceptor('photo'))
  @ApiOperation({ summary: 'Create a new ranking' })
  @ApiBody({ type: CreateRankingDto })
  @ApiResponse({
    status: 201,
    description: 'Ranking created successfully',
    schema: {
      properties: {
        id: { type: 'string', example: 'ranking-123' },
        name: { type: 'string', example: 'Ranking XPTO' },
        description: { type: 'string', example: 'Descrição do ranking' },
        banner: { type: 'string', example: 'https://cdn.com/banner.jpg' },
        createdAt: { type: 'string', format: 'date-time', example: '2024-07-01T12:00:00.000Z' },
      },
      example: {
        id: 'ranking-123',
        name: 'Ranking XPTO',
        description: 'Descrição do ranking',
        banner: 'https://cdn.com/banner.jpg',
        createdAt: '2024-07-01T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
    schema: { example: { message: 'Erro de validação' } },
  })
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
  @ApiOperation({ summary: 'Get all rankings for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of rankings retrieved successfully',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'string', example: 'ranking-123' },
          name: { type: 'string', example: 'Ranking XPTO' },
          description: { type: 'string', example: 'Descrição do ranking' },
          banner: { type: 'string', example: 'http://ranking-attachments.s3.us-east-1.amazonaws.com/banner.jpg' },
          createdAt: { type: 'string', format: 'date-time', example: '2024-07-01T12:00:00.000Z' },
          createdBy: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'user-123' },
              name: { type: 'string', example: 'John Doe' },
              email: { type: 'string', example: 'john.doe@example.com' },
              avatar: {
                type: 'object',
                properties: {
                  url: { type: 'string', example: 'http://ranking-attachments.s3.us-east-1.amazonaws.com/avatar.jpg' },
                },
              },
            },
          },
          criteria: {
            type: 'array',
            items: { type: 'string' },
            example: ['Qualidade', 'Preço', 'Localização', 'Atendimento'],
            description: 'Critérios de avaliação do ranking (máximo 4)',
          },
        },
      },
      example: [
        {
          id: 'ranking-123',
          name: 'Ranking XPTO',
          description: 'Descrição do ranking',
          banner: 'http://ranking-attachments.s3.us-east-1.amazonaws.com/banner.jpg',
          createdAt: '2024-07-01T12:00:00.000Z',
          createdBy: {
            id: 'user-123',
            name: 'John Doe',
            email: 'john.doe@example.com',
            avatar: {
              url: 'http://ranking-attachments.s3.us-east-1.amazonaws.com/avatar.jpg',
            },
          },
          criteria: ['Qualidade', 'Preço', 'Localização', 'Atendimento'],
        },
      ],
    },
  })
  async getAllRankings(@GetUser() userId: string) {
    Logger.log(
      `Getting all rankings for user ${JSON.stringify(userId)}`,
      RankingController.name,
    );
    return await this.rankingUserService.getAllRankingsByUserId(userId);
  }

  @Put(':rankingId')
  @ApiOperation({ summary: 'Update a ranking' })
  @ApiParam({ name: 'rankingId', description: 'ID of the ranking to update' })
  @ApiBody({ type: UpdateRankingDto })
  @ApiResponse({
    status: 200,
    description: 'Ranking updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Ranking not found',
  })
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

  @Post(':rankingId/invite')
  @ApiOperation({ summary: 'Invite a user to join a ranking' })
  @ApiParam({ name: 'rankingId', description: 'ID of the ranking to invite to' })
  @ApiBody({ type: CreateRankingInviteDto })
  @ApiResponse({
    status: 201,
    description: 'Invite sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - user already member or invite exists',
  })
  async inviteUserToRanking(
    @Param('rankingId') rankingId: string,
    @Body() createRankingInviteDto: CreateRankingInviteDto,
    @GetUser() userId: string,
  ) {
    Logger.log(
      `Inviting user to ranking ${rankingId}`,
      RankingController.name,
    );
    
    // Set the rankingId from the URL parameter
    createRankingInviteDto.rankingId = rankingId;
    
    return await this.rankingInviteService.createRankingInvite(
      createRankingInviteDto,
      userId,
    );
  }

  @Get(':rankingId/suggest-criteria')
  @ApiOperation({ summary: 'Get AI-suggested criteria for a ranking' })
  @ApiParam({ name: 'rankingId', description: 'ID of the ranking' })
  @ApiResponse({
    status: 200,
    description: 'AI suggestions retrieved successfully',
  })
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
  @ApiOperation({ summary: 'Get ranking criteria' })
  @ApiParam({ name: 'rankingId', description: 'ID of the ranking' })
  @ApiResponse({
    status: 200,
    description: 'Ranking criteria retrieved successfully',
  })
  async getRankingCriteria(@Param('rankingId') rankingId: string) {
    Logger.log(
      `Getting ranking criteria for ranking ${JSON.stringify(rankingId)}`,
      RankingController.name,
    );
    return await this.rankingService.getRankingCriteria(rankingId);
  }

  @Post(':rankingId/criteria')
  @ApiOperation({ summary: 'Create ranking criteria' })
  @ApiParam({ name: 'rankingId', description: 'ID of the ranking' })
  @ApiBody({ type: CreateRankingCriteriaDto })
  @ApiResponse({
    status: 201,
    description: 'Criteria created successfully',
  })
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
  @ApiOperation({ summary: 'Remove ranking criteria' })
  @ApiParam({ name: 'rankingId', description: 'ID of the ranking' })
  @ApiParam({ name: 'criteriaId', description: 'ID of the criteria to remove' })
  @ApiResponse({
    status: 200,
    description: 'Criteria removed successfully',
  })
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
