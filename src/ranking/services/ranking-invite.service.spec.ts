import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { RankingInviteService } from './ranking-invite.service';
import { RankingUserRepository } from '../repositories/ranking-user.repository';
import { UserRepository } from '../../user/repositories/user.repository';
import { RankingValidationsService } from './ranking-validations.service';
import { CreateRankingInviteDto } from '../dto/create-ranking-invite.dto';
import { AcceptRankingInviteDto } from '../dto/accept-ranking-invite.dto';

describe('RankingInviteService', () => {
  let service: RankingInviteService;
  let rankingUserRepository: jest.Mocked<RankingUserRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let rankingValidationService: jest.Mocked<RankingValidationsService>;

  beforeEach(async () => {
    const mockRankingUserRepository = {
      createRankingInvite: jest.fn(),
      getRankingInvitesByEmail: jest.fn(),
      getRankingInvitesByRankingId: jest.fn(),
      getRankingInviteById: jest.fn(),
      deleteRankingInvite: jest.fn(),
      addUserToRanking: jest.fn(),
      getRankingUserById: jest.fn(),
    };

    const mockUserRepository = {
      findByEmail: jest.fn(),
      findOne: jest.fn(),
    };

    const mockRankingValidationService = {
      existRanking: jest.fn(),
      existRankingUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RankingInviteService,
        {
          provide: RankingUserRepository,
          useValue: mockRankingUserRepository,
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: RankingValidationsService,
          useValue: mockRankingValidationService,
        },
      ],
    }).compile();

    service = module.get<RankingInviteService>(RankingInviteService);
    rankingUserRepository = module.get(RankingUserRepository);
    userRepository = module.get(UserRepository);
    rankingValidationService = module.get(RankingValidationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRankingInvite', () => {
    const createRankingInviteDto: CreateRankingInviteDto = {
      email: 'test@example.com',
      rankingId: 'ranking-123',
    };
    const invitedById = 'user-123';

    it('should create a ranking invite successfully', async () => {
      const mockInvite = {
        id: 'invite-123',
        email: 'test@example.com',
        rankingId: 'ranking-123',
        invitedById: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      rankingValidationService.existRanking.mockResolvedValue({} as any);
      rankingValidationService.existRankingUser.mockResolvedValue({} as any);
      userRepository.findByEmail.mockResolvedValue(null);
      rankingUserRepository.getRankingInvitesByEmail.mockResolvedValue([]);
      rankingUserRepository.createRankingInvite.mockResolvedValue(mockInvite);

      const result = await service.createRankingInvite(
        createRankingInviteDto,
        invitedById,
      );

      expect(result).toEqual({
        id: 'invite-123',
        email: 'test@example.com',
        rankingId: 'ranking-123',
        invitedById: 'user-123',
        createdAt: mockInvite.createdAt,
        message: 'Invite sent successfully',
      });
    });

    it('should throw error if user is already a member', async () => {
      const existingUser = { id: 'existing-user-123' };
      const existingMember = { id: 'ranking-123' };

      rankingValidationService.existRanking.mockResolvedValue({} as any);
      rankingValidationService.existRankingUser.mockResolvedValue({} as any);
      userRepository.findByEmail.mockResolvedValue(existingUser as any);
      rankingUserRepository.getRankingUserById.mockResolvedValue(
        existingMember as any,
      );

      await expect(
        service.createRankingInvite(createRankingInviteDto, invitedById),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if invite already exists', async () => {
      const existingInvite = {
        id: 'existing-invite-123',
        rankingId: 'ranking-123',
      };

      rankingValidationService.existRanking.mockResolvedValue({} as any);
      rankingValidationService.existRankingUser.mockResolvedValue({} as any);
      userRepository.findByEmail.mockResolvedValue(null);
      rankingUserRepository.getRankingInvitesByEmail.mockResolvedValue([
        existingInvite as any,
      ]);

      await expect(
        service.createRankingInvite(createRankingInviteDto, invitedById),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('acceptRankingInvite', () => {
    const acceptRankingInviteDto: AcceptRankingInviteDto = {
      inviteId: 'invite-123',
    };
    const userId = 'user-123';

    it('should accept a ranking invite successfully', async () => {
      const mockInvite = {
        id: 'invite-123',
        email: 'test@example.com',
        rankingId: 'ranking-123',
        ranking: {
          id: 'ranking-123',
          name: 'Test Ranking',
          description: 'Test Description',
        },
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      rankingUserRepository.getRankingInviteById.mockResolvedValue(
        mockInvite as any,
      );
      userRepository.findOne.mockResolvedValue(mockUser as any);
      rankingUserRepository.getRankingUserById.mockResolvedValue(null);
      rankingUserRepository.addUserToRanking.mockResolvedValue({} as any);
      rankingUserRepository.deleteRankingInvite.mockResolvedValue({} as any);

      const result = await service.acceptRankingInvite(
        acceptRankingInviteDto,
        userId,
      );

      expect(result).toEqual({
        message: 'Invite accepted successfully',
        rankingId: 'ranking-123',
        rankingName: 'Test Ranking',
      });
    });

    it('should throw error if invite not found', async () => {
      rankingUserRepository.getRankingInviteById.mockResolvedValue(null);

      await expect(
        service.acceptRankingInvite(acceptRankingInviteDto, userId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if user is already a member', async () => {
      const mockInvite = {
        id: 'invite-123',
        email: 'test@example.com',
        rankingId: 'ranking-123',
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      rankingUserRepository.getRankingInviteById.mockResolvedValue(
        mockInvite as any,
      );
      userRepository.findOne.mockResolvedValue(mockUser as any);
      rankingUserRepository.getRankingUserById.mockResolvedValue({} as any);

      await expect(
        service.acceptRankingInvite(acceptRankingInviteDto, userId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getRankingInvitesByEmail', () => {
    it('should get ranking invites by email successfully', async () => {
      const email = 'test@example.com';
      const mockInvites = [
        {
          id: 'invite-123',
          email: 'test@example.com',
          rankingId: 'ranking-123',
        },
      ];

      rankingUserRepository.getRankingInvitesByEmail.mockResolvedValue(
        mockInvites as any,
      );

      const result = await service.getRankingInvitesByEmail(email);

      expect(result).toEqual({
        invites: mockInvites,
        count: 1,
      });
    });
  });

  describe('getRankingInvitesByRankingId', () => {
    it('should get ranking invites by ranking id successfully', async () => {
      const rankingId = 'ranking-123';
      const userId = 'user-123';
      const mockInvites = [
        {
          id: 'invite-123',
          rankingId: 'ranking-123',
        },
      ];

      rankingValidationService.existRankingUser.mockResolvedValue({} as any);
      rankingUserRepository.getRankingInvitesByRankingId.mockResolvedValue(
        mockInvites as any,
      );

      const result = await service.getRankingInvitesByRankingId(
        rankingId,
        userId,
      );

      expect(result).toEqual({
        invites: mockInvites,
        count: 1,
      });
    });
  });
}); 