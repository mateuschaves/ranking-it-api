import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { RankingUserRepository } from '../repositories/ranking-user.repository';
import { UserRepository } from '../../user/repositories/user.repository';
import { RankingValidationsService } from './ranking-validations.service';
import { CreateRankingInviteDto } from '../dto/create-ranking-invite.dto';
import { AcceptRankingInviteDto } from '../dto/accept-ranking-invite.dto';
import { ExpoPushService } from '../../shared/services/expo-push.service';

@Injectable()
export class RankingInviteService {
  constructor(
    private readonly rankingUserRepository: RankingUserRepository,
    private readonly userRepository: UserRepository,
    private readonly rankingValidationService: RankingValidationsService,
    private readonly expoPushService: ExpoPushService,
  ) {}

  async createRankingInvite(
    createRankingInviteDto: CreateRankingInviteDto,
    invitedById: string,
  ) {
    try {
      Logger.log(
        `Creating ranking invite for email ${createRankingInviteDto.email}`,
        'RankingInviteService.createRankingInvite',
      );

      // Validate that the ranking exists and the user has access to it
      await this.rankingValidationService.existRanking(
        createRankingInviteDto.rankingId,
      );
      await this.rankingValidationService.existRankingUser(
        createRankingInviteDto.rankingId,
        invitedById,
      );

      // Check if user is already a member of the ranking
      const existingUser = await this.userRepository.findByEmail(
        createRankingInviteDto.email?.toLowerCase(),
      );

      if (existingUser) {
        // Nova verificação usando existsUserInRanking
        const isAlreadyMember = await this.rankingUserRepository.existsUserInRanking(
          existingUser.id,
          createRankingInviteDto.rankingId,
        );
        if (isAlreadyMember) {
          throw new BadRequestException(
            'User is already a member of this ranking',
          );
        }
      }

      // Check if invite already exists
      const existingInvites = await this.rankingUserRepository.getRankingInvitesByEmail(
        createRankingInviteDto.email?.toLowerCase(),
      );

      const inviteAlreadyExists = existingInvites.some(
        (invite) => invite.rankingId === createRankingInviteDto.rankingId,
      );

      if (inviteAlreadyExists) {
        throw new BadRequestException(
          'An invite for this user to this ranking already exists',
        );
      }

      // Create the invite
      const invite = await this.rankingUserRepository.createRankingInvite({
        email: createRankingInviteDto.email?.toLowerCase(),
        rankingId: createRankingInviteDto.rankingId,
        invitedById,
      });

      Logger.log(
        `Ranking invite created successfully: ${invite.id}`,
        'RankingInviteService.createRankingInvite',
      );

      // Send push notification if user exists and has a push token
      if (existingUser && existingUser.pushToken) {
        try {
          // Get ranking details for the notification (we already validated it exists)
          const ranking = await this.rankingValidationService.existRanking(
            createRankingInviteDto.rankingId,
          );
          
          // Get inviter details
          const inviter = await this.userRepository.findOne({ id: invitedById });
          
          const title = 'Novo convite para ranking! 🎯';
          const body = `${inviter?.name || 'Alguém'} convidou você para participar de "${ranking.name}"`;
          
          await this.expoPushService.sendPushNotification(
            existingUser.pushToken,
            title,
            body,
          );
          
          Logger.log(
            `Push notification sent to user ${existingUser.id} for ranking invite`,
            'RankingInviteService.createRankingInvite',
          );
        } catch (pushError) {
          // Don't fail the invite creation if push notification fails
          Logger.error(
            `Failed to send push notification for invite ${invite.id}: ${pushError}`,
            'RankingInviteService.createRankingInvite',
          );
        }
      }

      return {
        id: invite.id,
        email: invite.email,
        rankingId: invite.rankingId,
        invitedById: invite.invitedById,
        createdAt: invite.createdAt,
        message: 'Invite sent successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      Logger.error(
        `Error creating ranking invite: ${error}`,
        'RankingInviteService.createRankingInvite',
      );
      throw new BadRequestException('Error creating ranking invite');
    }
  }

  async getRankingInvitesByEmail(email: string) {
    try {
      Logger.log(
        `Getting ranking invites for email ${email}`,
        'RankingInviteService.getRankingInvitesByEmail',
      );

      const invites = await this.rankingUserRepository.getRankingInvitesByEmail(
        email,
      );

      return {
        invites,
        count: invites.length,
      };
    } catch (error) {
      Logger.error(
        `Error getting ranking invites by email: ${error}`,
        'RankingInviteService.getRankingInvitesByEmail',
      );
      throw new BadRequestException('Error getting ranking invites');
    }
  }

  async getRankingInvitesByRankingId(rankingId: string, userId: string) {
    try {
      Logger.log(
        `Getting ranking invites for ranking ${rankingId}`,
        'RankingInviteService.getRankingInvitesByRankingId',
      );

      // Validate that the user has access to the ranking
      await this.rankingValidationService.existRankingUser(rankingId, userId);

      const invites = await this.rankingUserRepository.getRankingInvitesByRankingId(
        rankingId,
      );

      return {
        invites,
        count: invites.length,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      Logger.error(
        `Error getting ranking invites by ranking id: ${error}`,
        'RankingInviteService.getRankingInvitesByRankingId',
      );
      throw new BadRequestException('Error getting ranking invites');
    }
  }

  async acceptRankingInvite(
    acceptRankingInviteDto: AcceptRankingInviteDto,
    userId: string,
  ) {
    try {
      Logger.log(
        `Accepting ranking invite ${acceptRankingInviteDto.inviteId}`,
        'RankingInviteService.acceptRankingInvite',
      );

      // Get the invite
      const invite = await this.rankingUserRepository.getRankingInviteById(
        acceptRankingInviteDto.inviteId,
      );

      if (!invite) {
        throw new BadRequestException('Invite not found');
      }

      // Get the current user
      const user = await this.userRepository.findOne({ id: userId });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Check if the invite is for the current user's email
      if (invite.email !== user.email) {
        throw new BadRequestException('This invite is not for your email');
      }

      // Check if user is already a member of the ranking
      const isAlreadyMember = await this.rankingUserRepository.getRankingUserById(
        invite.rankingId,
        userId,
      );

      if (isAlreadyMember) {
        throw new BadRequestException(
          'You are already a member of this ranking',
        );
      }

      // Add user to the ranking
      await this.rankingUserRepository.addUserToRanking(
        userId,
        invite.rankingId,
      );

      // Delete the invite
      await this.rankingUserRepository.deleteRankingInvite(
        acceptRankingInviteDto.inviteId,
      );

      Logger.log(
        `Ranking invite accepted successfully: ${acceptRankingInviteDto.inviteId}`,
        'RankingInviteService.acceptRankingInvite',
      );

      // Notify all ranking users (excluding the acceptor)
      try {
        const tokens = await this.rankingUserRepository.getRankingUsersPushTokens(
          invite.rankingId,
          userId,
        );
        if (tokens?.length > 0) {
          await this.expoPushService.sendBulkPushNotifications(
            tokens,
            'Novo membro no ranking 🎉',
            `${user.name || 'Um usuário'} entrou no ranking "${invite.ranking.name}"`,
          );
        }
      } catch (pushError) {
        Logger.error(
          `Failed to send acceptance notification: ${pushError}`,
          'RankingInviteService.acceptRankingInvite',
        );
      }

      return {
        message: 'Invite accepted successfully',
        rankingId: invite.rankingId,
        rankingName: invite.ranking.name,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      Logger.error(
        `Error accepting ranking invite: ${error}`,
        'RankingInviteService.acceptRankingInvite',
      );
      throw new BadRequestException('Error accepting ranking invite');
    }
  }

  async declineRankingInvite(inviteId: string, userId: string) {
    try {
      Logger.log(
        `Declining ranking invite ${inviteId}`,
        'RankingInviteService.declineRankingInvite',
      );

      // Get the invite
      const invite = await this.rankingUserRepository.getRankingInviteById(
        inviteId,
      );

      if (!invite) {
        throw new BadRequestException('Invite not found');
      }

      // Get the current user
      const user = await this.userRepository.findOne({ id: userId });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Check if the invite is for the current user's email
      if (invite.email !== user.email) {
        throw new BadRequestException('This invite is not for your email');
      }

      // Delete the invite
      await this.rankingUserRepository.deleteRankingInvite(inviteId);

      Logger.log(
        `Ranking invite declined successfully: ${inviteId}`,
        'RankingInviteService.declineRankingInvite',
      );

      // Notify ranking users of decline (excluding decliner)
      try {
        const user = await this.userRepository.findOne({ id: userId });
        const tokens = await this.rankingUserRepository.getRankingUsersPushTokens(
          invite.rankingId,
          userId,
        );
        if (tokens?.length > 0) {
          await this.expoPushService.sendBulkPushNotifications(
            tokens,
            'Convite recusado ❌',
            `${user?.name || 'Um usuário'} recusou o convite do ranking "${invite.ranking.name}"`,
          );
        }
      } catch (pushError) {
        Logger.error(
          `Failed to send decline notification: ${pushError}`,
          'RankingInviteService.declineRankingInvite',
        );
      }

      return {
        message: 'Invite declined successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      Logger.error(
        `Error declining ranking invite: ${error}`,
        'RankingInviteService.declineRankingInvite',
      );
      throw new BadRequestException('Error declining ranking invite');
    }
  }

  async cancelRankingInvite(inviteId: string, userId: string) {
    try {
      Logger.log(
        `Canceling ranking invite ${inviteId}`,
        'RankingInviteService.cancelRankingInvite',
      );

      // Get the invite
      const invite = await this.rankingUserRepository.getRankingInviteById(
        inviteId,
      );

      if (!invite) {
        throw new BadRequestException('Invite not found');
      }

      // Check if the user is the one who sent the invite or has access to the ranking
      if (invite.invitedById !== userId) {
        await this.rankingValidationService.existRankingUser(
          invite.rankingId,
          userId,
        );
      }

      // Delete the invite
      await this.rankingUserRepository.deleteRankingInvite(inviteId);

      Logger.log(
        `Ranking invite canceled successfully: ${inviteId}`,
        'RankingInviteService.cancelRankingInvite',
      );

      return {
        message: 'Invite canceled successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      Logger.error(
        `Error canceling ranking invite: ${error}`,
        'RankingInviteService.cancelRankingInvite',
      );
      throw new BadRequestException('Error canceling ranking invite');
    }
  }
} 