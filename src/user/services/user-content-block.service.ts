import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { UserContentBlockRepository } from '../repositories/user-content-block.repository';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserContentBlockService {
  constructor(
    private readonly userContentBlockRepository: UserContentBlockRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async blockUser(blockerId: string, blockedUserId: string) {
    try {
      if (blockerId === blockedUserId) {
        throw new BadRequestException('Você não pode bloquear você mesmo 😅');
      }

      const blockedUser = await this.userRepository.findOne(
        { id: blockedUserId },
        false,
        true,
      );

      if (!blockedUser) {
        throw new BadRequestException('Usuário não encontrado 😕');
      }

      const alreadyBlocked =
        await this.userContentBlockRepository.findBlock(
          blockerId,
          blockedUserId,
        );

      if (alreadyBlocked) {
        throw new BadRequestException('Usuário já bloqueado 🙅‍♂️');
      }

      await this.userContentBlockRepository.create(blockerId, blockedUserId);

      return {
        message: 'Usuário bloqueado com sucesso ✅',
      };
    } catch (error) {
      Logger.error(error, 'UserContentBlockService.blockUser');
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        'Não foi possível bloquear o usuário 😔',
      );
    }
  }

  async unblockUser(blockerId: string, blockedUserId: string) {
    try {
      const block = await this.userContentBlockRepository.findBlock(
        blockerId,
        blockedUserId,
      );

      if (!block) {
        throw new BadRequestException('Usuário não está bloqueado 🤷');
      }

      await this.userContentBlockRepository.delete(blockerId, blockedUserId);

      return {
        message: 'Usuário desbloqueado com sucesso ✅',
      };
    } catch (error) {
      Logger.error(error, 'UserContentBlockService.unblockUser');
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        'Não foi possível desbloquear o usuário 😔',
      );
    }
  }

  async listBlockedUsers(blockerId: string) {
    try {
      const blocks =
        await this.userContentBlockRepository.listBlocks(blockerId);

      return blocks.map(block => ({
        blockedUserId: block.blockedUser.id,
        name: block.blockedUser.name,
        email: block.blockedUser.email,
        blockedAt: block.createdAt,
      }));
    } catch (error) {
      Logger.error(error, 'UserContentBlockService.listBlockedUsers');
      throw new BadRequestException(
        'Não foi possível listar usuários bloqueados 😔',
      );
    }
  }

  async getBlockedUserIds(blockerId: string) {
    return this.userContentBlockRepository.getBlockedUserIds(blockerId);
  }
}

