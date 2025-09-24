import { Test, TestingModule } from '@nestjs/testing';
import { RankingValidationsService } from './ranking-validations.service';
import { UserRepository } from '../../user/repositories/user.repository';
import { RankingRepository } from '../repositories/ranking.repository';
import { RankingUserRepository } from '../repositories/ranking-user.repository';
import { BadRequestException } from '@nestjs/common';

describe('RankingValidationsService', () => {
  let service: RankingValidationsService;
  let userRepository: jest.Mocked<UserRepository>;
  let rankingRepository: jest.Mocked<RankingRepository>;
  let rankingUserRepository: jest.Mocked<RankingUserRepository>;

  beforeEach(async () => {
    const mockUserRepository = {
      findOne: jest.fn(),
    };

    const mockRankingRepository = {
      getRankingById: jest.fn(),
    };

    const mockRankingUserRepository = {
      getRankingUsers: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RankingValidationsService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: RankingRepository,
          useValue: mockRankingRepository,
        },
        {
          provide: RankingUserRepository,
          useValue: mockRankingUserRepository,
        },
      ],
    }).compile();

    service = module.get<RankingValidationsService>(RankingValidationsService);
    userRepository = module.get(UserRepository);
    rankingRepository = module.get(RankingRepository);
    rankingUserRepository = module.get(RankingUserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('existUser', () => {
    it('should return user when user exists', async () => {
      const userId = 'user-123';
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      };

      userRepository.findOne.mockResolvedValue(mockUser as any);

      const result = await service.existUser(userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({ id: userId });
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException when user does not exist', async () => {
      const userId = 'user-123';

      userRepository.findOne.mockResolvedValue(null);

      await expect(service.existUser(userId)).rejects.toThrow(
        new BadRequestException('Usuário não encontrado 🕵️‍♂️'),
      );
    });
  });

  describe('existRanking', () => {
    it('should return ranking when ranking exists', async () => {
      const rankingId = 'ranking-123';
      const mockRanking = {
        id: 'ranking-123',
        name: 'Test Ranking',
        ownerId: 'user-123',
      };

      rankingRepository.getRankingById.mockResolvedValue(mockRanking as any);

      const result = await service.existRanking(rankingId);

      expect(rankingRepository.getRankingById).toHaveBeenCalledWith(rankingId);
      expect(result).toEqual(mockRanking);
    });

    it('should throw BadRequestException when ranking does not exist', async () => {
      const rankingId = 'ranking-123';

      rankingRepository.getRankingById.mockResolvedValue(null);

      await expect(service.existRanking(rankingId)).rejects.toThrow(
        new BadRequestException('Ranking não encontrado 🕵️‍♂️'),
      );
    });
  });

  describe('existRankingUser', () => {
    it('should return ranking users when user is part of ranking', async () => {
      const rankingId = 'ranking-123';
      const userId = 'user-123';
      const mockRankingUsers = [
        {
          id: 'user-ranking-123',
          userId: 'user-123',
          rankingId: 'ranking-123',
        },
      ];

      rankingUserRepository.getRankingUsers.mockResolvedValue(mockRankingUsers as any);

      const result = await service.existRankingUser(rankingId, userId);

      expect(rankingUserRepository.getRankingUsers).toHaveBeenCalledWith(rankingId);
      expect(result).toEqual(mockRankingUsers);
    });

    it('should throw BadRequestException when user is not part of ranking', async () => {
      const rankingId = 'ranking-123';
      const userId = 'user-123';

      rankingUserRepository.getRankingUsers.mockResolvedValue([]);

      await expect(service.existRankingUser(rankingId, userId)).rejects.toThrow(
        new BadRequestException('Usuário não faz parte do ranking 🕵️‍♂️'),
      );
    });
  });
});
