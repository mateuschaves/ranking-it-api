import { Test, TestingModule } from '@nestjs/testing';
import { UserContentBlockService } from './user-content-block.service';
import { UserContentBlockRepository } from '../repositories/user-content-block.repository';
import { UserRepository } from '../repositories/user.repository';
import { BadRequestException } from '@nestjs/common';

describe('UserContentBlockService', () => {
  let service: UserContentBlockService;
  let userContentBlockRepository: UserContentBlockRepository;
  let userRepository: UserRepository;

  const mockUserContentBlockRepository = {
    create: jest.fn(),
    delete: jest.fn(),
    findBlock: jest.fn(),
    listBlocks: jest.fn(),
    getBlockedUserIds: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserContentBlockService,
        {
          provide: UserContentBlockRepository,
          useValue: mockUserContentBlockRepository,
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserContentBlockService>(UserContentBlockService);
    userContentBlockRepository = module.get<UserContentBlockRepository>(
      UserContentBlockRepository,
    );
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('blockUser', () => {
    it('should block a user successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 'blocked-id' });
      mockUserContentBlockRepository.findBlock.mockResolvedValue(null);
      mockUserContentBlockRepository.create.mockResolvedValue({});

      const result = await service.blockUser('blocker', 'blocked');

      expect(userRepository.findOne).toHaveBeenCalledWith(
        { id: 'blocked' },
        false,
        true,
      );
      expect(userContentBlockRepository.create).toHaveBeenCalledWith(
        'blocker',
        'blocked',
      );
      expect(result).toEqual({ message: 'Usuário bloqueado com sucesso ✅' });
    });

    it('should not allow blocking oneself', async () => {
      await expect(service.blockUser('user', 'user')).rejects.toThrow(
        BadRequestException,
      );
      expect(userRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw if target user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.blockUser('blocker', 'unknown')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if user already blocked', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 'blocked-id' });
      mockUserContentBlockRepository.findBlock.mockResolvedValue({
        id: 'block-id',
      });

      await expect(service.blockUser('blocker', 'blocked')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('unblockUser', () => {
    it('should unblock user successfully', async () => {
      mockUserContentBlockRepository.findBlock.mockResolvedValue({
        id: 'block-id',
      });
      mockUserContentBlockRepository.delete.mockResolvedValue({ count: 1 });

      const result = await service.unblockUser('blocker', 'blocked');

      expect(userContentBlockRepository.delete).toHaveBeenCalledWith(
        'blocker',
        'blocked',
      );
      expect(result).toEqual({ message: 'Usuário desbloqueado com sucesso ✅' });
    });

    it('should throw if user not blocked', async () => {
      mockUserContentBlockRepository.findBlock.mockResolvedValue(null);

      await expect(service.unblockUser('blocker', 'blocked')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('listBlockedUsers', () => {
    it('should list blocked users', async () => {
      mockUserContentBlockRepository.listBlocks.mockResolvedValue([
        {
          blockedUser: { id: 'blocked', name: 'User', email: 'user@test.com' },
          createdAt: new Date('2023-01-01'),
        },
      ]);

      const result = await service.listBlockedUsers('blocker');

      expect(result).toEqual([
        {
          blockedUserId: 'blocked',
          name: 'User',
          email: 'user@test.com',
          blockedAt: new Date('2023-01-01'),
        },
      ]);
    });
  });
});

