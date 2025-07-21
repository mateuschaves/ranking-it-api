import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../../user/decorators/get-current-user.decorator';
import { RankingInviteService } from '../services/ranking-invite.service';
import { UserRepository } from '../../user/repositories/user.repository';
import { CreateRankingInviteDto } from '../dto/create-ranking-invite.dto';
import { AcceptRankingInviteDto } from '../dto/accept-ranking-invite.dto';

@ApiTags('Ranking Invites')
@ApiBearerAuth('JWT-auth')
@Controller('ranking-invites')
@UseGuards(AuthGuard('jwt'))
export class RankingInviteController {
  constructor(
    private readonly rankingInviteService: RankingInviteService,
    private readonly userRepository: UserRepository,
  ) {}

  @Post('')
  @ApiOperation({ summary: 'Create a ranking invite' })
  @ApiBody({ type: CreateRankingInviteDto })
  @ApiResponse({
    status: 201,
    description: 'Invite created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - user already member or invite exists',
  })
  async createRankingInvite(
    @Body() createRankingInviteDto: CreateRankingInviteDto,
    @GetUser() userId: string,
  ) {
    Logger.log(
      `Creating ranking invite for email ${createRankingInviteDto.email}`,
      RankingInviteController.name,
    );
    return await this.rankingInviteService.createRankingInvite(
      createRankingInviteDto,
      userId,
    );
  }

  @Get('my-invites')
  @ApiOperation({ summary: 'Get all invites for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'User invites retrieved successfully',
  })
  async getMyRankingInvites(@GetUser() userId: string) {
    Logger.log(
      `Getting ranking invites for user ${userId}`,
      RankingInviteController.name,
    );
    
    // First get the user's email
    const user = await this.userRepository.findOne({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }
    
    return await this.rankingInviteService.getRankingInvitesByEmail(user.email);
  }

  @Get('ranking/:rankingId')
  @ApiOperation({ summary: 'Get all invites for a specific ranking' })
  @ApiParam({ name: 'rankingId', description: 'ID of the ranking' })
  @ApiResponse({
    status: 200,
    description: 'Ranking invites retrieved successfully',
  })
  async getRankingInvitesByRankingId(
    @Param('rankingId') rankingId: string,
    @GetUser() userId: string,
  ) {
    Logger.log(
      `Getting ranking invites for ranking ${rankingId}`,
      RankingInviteController.name,
    );
    return await this.rankingInviteService.getRankingInvitesByRankingId(
      rankingId,
      userId,
    );
  }

  @Post('accept')
  @ApiOperation({ summary: 'Aceitar convite de ranking' })
  @ApiBody({
    type: AcceptRankingInviteDto,
    examples: {
      default: {
        value: { inviteId: 'invite-123' },
        description: 'ID do convite a ser aceito',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Convite aceito com sucesso',
    schema: { example: { message: 'Invite accepted successfully', rankingId: 'ranking-123', rankingName: 'Ranking XPTO' } },
  })
  @ApiResponse({
    status: 400,
    description: 'Convite não encontrado, já aceito ou usuário não tem permissão',
  })
  async acceptRankingInvite(
    @Body() acceptRankingInviteDto: AcceptRankingInviteDto,
    @GetUser() userId: string,
  ) {
    Logger.log(
      `Accepting ranking invite ${acceptRankingInviteDto.inviteId}`,
      RankingInviteController.name,
    );
    return await this.rankingInviteService.acceptRankingInvite(
      acceptRankingInviteDto,
      userId,
    );
  }

  @Delete('decline/:inviteId')
  @ApiOperation({ summary: 'Recusar convite de ranking' })
  @ApiParam({ name: 'inviteId', description: 'ID do convite a ser recusado', example: 'invite-123' })
  @ApiResponse({
    status: 200,
    description: 'Convite recusado com sucesso',
    schema: { example: { message: 'Invite declined successfully' } },
  })
  @ApiResponse({
    status: 400,
    description: 'Convite não encontrado, já recusado ou usuário não tem permissão',
  })
  async declineRankingInvite(
    @Param('inviteId') inviteId: string,
    @GetUser() userId: string,
  ) {
    Logger.log(
      `Declining ranking invite ${inviteId}`,
      RankingInviteController.name,
    );
    return await this.rankingInviteService.declineRankingInvite(
      inviteId,
      userId,
    );
  }

  @Delete('cancel/:inviteId')
  @ApiOperation({ summary: 'Cancel a ranking invite (by sender or ranking member)' })
  @ApiParam({ name: 'inviteId', description: 'ID of the invite to cancel' })
  @ApiResponse({
    status: 200,
    description: 'Invite canceled successfully',
  })
  async cancelRankingInvite(
    @Param('inviteId') inviteId: string,
    @GetUser() userId: string,
  ) {
    Logger.log(
      `Canceling ranking invite ${inviteId}`,
      RankingInviteController.name,
    );
    return await this.rankingInviteService.cancelRankingInvite(
      inviteId,
      userId,
    );
  }
} 