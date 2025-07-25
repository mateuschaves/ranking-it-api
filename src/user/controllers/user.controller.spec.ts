import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';
import { RankingUserRepository } from '../../ranking/repositories/ranking-user.repository';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const mockUserService = {
      signup: jest.fn(),
      signin: jest.fn(),
      refreshToken: jest.fn(),
      updateAvatar: jest.fn(),
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
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
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
});
