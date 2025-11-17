import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';
import { RankingUserRepository } from '../../ranking/repositories/ranking-user.repository';
import { UserContentBlockService } from '../services/user-content-block.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let userContentBlockService: UserContentBlockService;

  beforeEach(async () => {
    const mockUserService = {
      signup: jest.fn(),
      signin: jest.fn(),
      refreshToken: jest.fn(),
      updateAvatar: jest.fn(),
      updatePushToken: jest.fn(),
      deactivateAccount: jest.fn(),
    };

    const mockUserContentBlockService = {
      listBlockedUsers: jest.fn(),
      blockUser: jest.fn(),
      unblockUser: jest.fn(),
    };

    const mockUserRepository = {
      findOne: jest.fn(),
      findByEmail: jest.fn(),
      findByRefreshToken: jest.fn(),
      updateById: jest.fn(),
    };

    const mockRankingUserRepository = {
      getRankingInvitesByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: RankingUserRepository,
          useValue: mockRankingUserRepository,
        },
        {
          provide: UserContentBlockService,
          useValue: mockUserContentBlockService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    userContentBlockService = module.get<UserContentBlockService>(
      UserContentBlockService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('refreshToken', () => {
    it('should return new tokens on valid refresh token', async () => {
      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
      };
      (userService.refreshToken as jest.Mock).mockResolvedValue(mockResponse);
      const result = await controller.refreshToken({ refreshToken: 'valid-token' });
      expect(result).toEqual(mockResponse);
      expect(userService.refreshToken).toHaveBeenCalledWith('valid-token');
    });

    it('should throw error on invalid refresh token', async () => {
      (userService.refreshToken as jest.Mock).mockRejectedValue(new Error('Invalid refresh token'));
      await expect(controller.refreshToken({ refreshToken: 'invalid-token' })).rejects.toThrow('Invalid refresh token');
      expect(userService.refreshToken).toHaveBeenCalledWith('invalid-token');
    });
  });

  describe('updatePushToken', () => {
    it('should update push token successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Push token atualizado com sucesso',
      };
      (userService.updatePushToken as jest.Mock).mockResolvedValue(mockResponse);
      const result = await controller.updatePushToken('user-123', { pushToken: 'ExponentPushToken[test]' });
      expect(result).toEqual(mockResponse);
      expect(userService.updatePushToken).toHaveBeenCalledWith('user-123', 'ExponentPushToken[test]');
    });

    it('should throw error when user not found', async () => {
      (userService.updatePushToken as jest.Mock).mockRejectedValue(new Error('Usuário não encontrado'));
      await expect(controller.updatePushToken('invalid-user', { pushToken: 'ExponentPushToken[test]' })).rejects.toThrow('Usuário não encontrado');
      expect(userService.updatePushToken).toHaveBeenCalledWith('invalid-user', 'ExponentPushToken[test]');
    });
  });

  describe('deactivateAccount', () => {
    it('should call service to deactivate account', async () => {
      const mockResponse = { message: 'Conta desativada com sucesso ✅' };
      (userService.deactivateAccount as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.deactivateAccount('user-123', 'user-123');

      expect(result).toEqual(mockResponse);
      expect(userService.deactivateAccount).toHaveBeenCalledWith('user-123', 'user-123', undefined);
    });

    it('should call service to deactivate account with reason', async () => {
      const mockResponse = { message: 'Conta desativada com sucesso ✅' };
      const reason = 'Não estou mais usando o aplicativo';
      (userService.deactivateAccount as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.deactivateAccount('user-123', 'user-123', { reason });

      expect(result).toEqual(mockResponse);
      expect(userService.deactivateAccount).toHaveBeenCalledWith('user-123', 'user-123', reason);
    });

    it('should propagate errors from service', async () => {
      (userService.deactivateAccount as jest.Mock).mockRejectedValue(
        new Error('Usuário não encontrado'),
      );

      await expect(
        controller.deactivateAccount('user-123', 'user-123'),
      ).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('content blocks', () => {
    it('should list blocked users', async () => {
      const mockList = [{ blockedUserId: 'blocked' }];
      (userContentBlockService.listBlockedUsers as jest.Mock).mockResolvedValue(mockList);

      const result = await controller.listBlockedUsers('user-123');

      expect(result).toEqual(mockList);
      expect(userContentBlockService.listBlockedUsers).toHaveBeenCalledWith('user-123');
    });

    it('should block user', async () => {
      const mockResponse = { message: 'Usuário bloqueado com sucesso ✅' };
      (userContentBlockService.blockUser as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.blockUser('user-123', { blockedUserId: 'blocked' });

      expect(result).toEqual(mockResponse);
      expect(userContentBlockService.blockUser).toHaveBeenCalledWith('user-123', 'blocked');
    });

    it('should unblock user', async () => {
      const mockResponse = { message: 'Usuário desbloqueado com sucesso ✅' };
      (userContentBlockService.unblockUser as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.unblockUser('user-123', 'blocked');

      expect(result).toEqual(mockResponse);
      expect(userContentBlockService.unblockUser).toHaveBeenCalledWith('user-123', 'blocked');
    });
  });
});
