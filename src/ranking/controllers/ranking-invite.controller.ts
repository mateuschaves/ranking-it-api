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
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../../user/decorators/get-current-user.decorator';
import { RankingInviteService } from '../services/ranking-invite.service';
import { UserRepository } from '../../user/repositories/user.repository';
import { CreateRankingInviteDto } from '../dto/create-ranking-invite.dto';
import { AcceptRankingInviteDto } from '../dto/accept-ranking-invite.dto';

@Controller('ranking-invites')
@UseGuards(AuthGuard('jwt'))
export class RankingInviteController {
  constructor(
    private readonly rankingInviteService: RankingInviteService,
    private readonly userRepository: UserRepository,
  ) {}

  @Post('')
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