import { Test, TestingModule } from '@nestjs/testing';
import { RankingScoreService } from './ranking-score.service';
import { RankingScoreRepository } from '../repositories/ranking-score.repository';
import { RankingValidationsService } from './ranking-validations.service';
import CreateRankingItemScoreDto from '../dto/create-ranking-item-score.dto';
import CreateMultipleRankingItemScoresDto from '../dto/create-multiple-ranking-item-scores.dto';
import { RankingUserRepository } from '../repositories/ranking-user.repository';
import { ExpoPushService } from 'src/shared/services/expo-push.service';
import { UserRepository } from 'src/user/repositories/user.repository';

describe('RankingScoreService', () => {
  let service: RankingScoreService;
  let rankingScoreRepository: RankingScoreRepository;
  let rankingValidationsService: RankingValidationsService;
  let rankingUserRepository: RankingUserRepository;
  let expoPushService: ExpoPushService;
  let userRepository: UserRepository;

  const mockRankingScoreRepository = {
    createRankingScore: jest.fn(),
    getRankingScores: jest.fn(),
    getRankingScoreById: jest.fn(),
    updateRankingScore: jest.fn(),
    deleteRankingScore: jest.fn(),
    getAvgRankingItemScore: jest.fn(),
    createMultipleRankingScores: jest.fn(),
    updateMultipleRankingScores: jest.fn(),
  };

  const mockRankingValidationsService = {
    existRankingItem: jest.fn(),
    existRankingCriteria: jest.fn(),
    existRankingItemCriteriaScore: jest.fn(),
  };

  const mockRankingUserRepository = {
    getRankingUsersPushTokens: jest.fn().mockResolvedValue([]),
  };

  const mockExpoPushService = {
    sendBulkPushNotifications: jest.fn().mockResolvedValue(undefined),
  };

  const mockUserRepository = {
    findOne: jest.fn().mockResolvedValue({ id: 'user-123', name: 'Test User' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RankingScoreService,
        {
          provide: RankingScoreRepository,
          useValue: mockRankingScoreRepository,
        },
        {
          provide: RankingValidationsService,
          useValue: mockRankingValidationsService,
        },
        {
          provide: RankingUserRepository,
          useValue: mockRankingUserRepository,
        },
        {
          provide: ExpoPushService,
          useValue: mockExpoPushService,
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<RankingScoreService>(RankingScoreService);
    rankingScoreRepository = module.get<RankingScoreRepository>(RankingScoreRepository);
    rankingValidationsService = module.get<RankingValidationsService>(RankingValidationsService);
    rankingUserRepository = module.get<RankingUserRepository>(RankingUserRepository);
    expoPushService = module.get<ExpoPushService>(ExpoPushService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRankingScore', () => {
    it('should create a new ranking score', async () => {
      const createRankingScoreDto: CreateRankingItemScoreDto = {
        rankingItemId: 'item-id',
        userId: 'user-id',
        rankingCriteriaId: 'criteria-id',
        score: 8.5,
      };

      const expectedResult = {
        id: 'score-id',
        rankingItemId: 'item-id',
        userId: 'user-id',
        rankingCriteriaId: 'criteria-id',
        score: 8.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRankingValidationsService.existRankingItem.mockResolvedValue(undefined);
      mockRankingValidationsService.existRankingCriteria.mockResolvedValue(undefined);
      mockRankingValidationsService.existRankingItemCriteriaScore.mockResolvedValue(null);
      mockRankingScoreRepository.createRankingScore.mockResolvedValue(expectedResult);

      const result = await service.createRankingScore(createRankingScoreDto);

      expect(rankingValidationsService.existRankingItem).toHaveBeenCalledWith('item-id');
      expect(rankingValidationsService.existRankingCriteria).toHaveBeenCalledWith('criteria-id');
      expect(rankingValidationsService.existRankingItemCriteriaScore).toHaveBeenCalledWith('item-id', 'user-id', 'criteria-id');
      expect(rankingScoreRepository.createRankingScore).toHaveBeenCalledWith({
        userId: 'user-id',
        score: 8.5,
        rankingItemId: 'item-id',
        rankingCriteriaId: 'criteria-id',
      });
      expect(result).toEqual(expectedResult);
    });

    it('should update existing ranking score', async () => {
      const createRankingScoreDto: CreateRankingItemScoreDto = {
        rankingItemId: 'item-id',
        userId: 'user-id',
        rankingCriteriaId: 'criteria-id',
        score: 9.0,
      };

      const existingScore = {
        id: 'existing-score-id',
        rankingItemId: 'item-id',
        userId: 'user-id',
        rankingCriteriaId: 'criteria-id',
        score: 8.5,
      };

      const expectedResult = {
        ...existingScore,
        score: 9.0,
        updatedAt: new Date(),
      };

      mockRankingValidationsService.existRankingItem.mockResolvedValue(undefined);
      mockRankingValidationsService.existRankingCriteria.mockResolvedValue(undefined);
      mockRankingValidationsService.existRankingItemCriteriaScore.mockResolvedValue(existingScore);
      mockRankingScoreRepository.updateRankingScore.mockResolvedValue(expectedResult);

      const result = await service.createRankingScore(createRankingScoreDto);

      expect(rankingValidationsService.existRankingItemCriteriaScore).toHaveBeenCalledWith('item-id', 'user-id', 'criteria-id');
      expect(rankingScoreRepository.updateRankingScore).toHaveBeenCalledWith('existing-score-id', { score: 9.0 });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getRankingItemScores', () => {
    it('should get ranking item scores', async () => {
      const rankingItemId = 'item-id';

      const expectedResult = [
        {
          id: 'score-id-1',
          score: 8.5,
          rankingItemId: 'item-id',
          user: {
            id: 'user-id-1',
            name: 'User 1',
            avatar: 'avatar-1',
          },
          rankingCriteria: {
            id: 'criteria-id-1',
            name: 'Criteria 1',
          },
        },
        {
          id: 'score-id-2',
          score: 7.0,
          rankingItemId: 'item-id',
          user: {
            id: 'user-id-2',
            name: 'User 2',
            avatar: 'avatar-2',
          },
          rankingCriteria: {
            id: 'criteria-id-2',
            name: 'Criteria 2',
          },
        },
      ];

      mockRankingScoreRepository.getRankingScores.mockResolvedValue(expectedResult);

      const result = await service.getRankingItemScores(rankingItemId);

      expect(rankingScoreRepository.getRankingScores).toHaveBeenCalledWith(rankingItemId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateRankingScore', () => {
    it('should update a ranking score', async () => {
      const rankingScoreId = 'score-id';
      const newScore = 9.0;

      const mockScore = {
        id: 'score-id',
        rankingItemId: 'item-id',
        userId: 'user-id',
        rankingCriteriaId: 'criteria-id',
        score: 8.5,
      };

      const expectedResult = {
        ...mockScore,
        score: 9.0,
        updatedAt: new Date(),
      };

      mockRankingScoreRepository.getRankingScoreById.mockResolvedValue(mockScore);
      mockRankingScoreRepository.updateRankingScore.mockResolvedValue(expectedResult);

      const result = await service.updateRankingScore(rankingScoreId, newScore);

      expect(rankingScoreRepository.getRankingScoreById).toHaveBeenCalledWith(rankingScoreId);
      expect(rankingScoreRepository.updateRankingScore).toHaveBeenCalledWith('score-id', { score: 9.0 });
      expect(result).toEqual(expectedResult);
    });

    it('should throw error if score not found', async () => {
      const rankingScoreId = 'score-id';
      const newScore = 9.0;

      mockRankingScoreRepository.getRankingScoreById.mockResolvedValue(null);

      await expect(service.updateRankingScore(rankingScoreId, newScore)).rejects.toThrow('Pontuação do item do ranking não encontrada 😔');
    });
  });

  describe('createMultipleRankingScores', () => {
    it('should create multiple new ranking scores', async () => {
      const createMultipleScoresDto: CreateMultipleRankingItemScoresDto = {
        rankingItemId: 'item-id',
        userId: 'user-id',
        scores: [
          { rankingCriteriaId: 'criteria-1', score: 8.5 },
          { rankingCriteriaId: 'criteria-2', score: 9.0 },
          { rankingCriteriaId: 'criteria-3', score: 7.5 },
        ],
      };

      const mockRankingItem = {
        id: 'item-id',
        rankingId: 'ranking-id',
        name: 'Test Item',
      };

      const mockCreatedScores = [
        {
          id: 'score-1',
          rankingItemId: 'item-id',
          userId: 'user-id',
          rankingCriteriaId: 'criteria-1',
          score: 8.5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'score-2',
          rankingItemId: 'item-id',
          userId: 'user-id',
          rankingCriteriaId: 'criteria-2',
          score: 9.0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'score-3',
          rankingItemId: 'item-id',
          userId: 'user-id',
          rankingCriteriaId: 'criteria-3',
          score: 7.5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRankingValidationsService.existRankingItem.mockResolvedValue(mockRankingItem);
      mockRankingValidationsService.existRankingCriteria.mockResolvedValue(undefined);
      mockRankingValidationsService.existRankingItemCriteriaScore.mockResolvedValue(null);
      mockRankingScoreRepository.createMultipleRankingScores.mockResolvedValue({ count: 3 });

      const result = await service.createMultipleRankingScores(createMultipleScoresDto);

      expect(rankingValidationsService.existRankingItem).toHaveBeenCalledWith('item-id');
      expect(rankingValidationsService.existRankingCriteria).toHaveBeenCalledTimes(3);
      expect(rankingValidationsService.existRankingCriteria).toHaveBeenCalledWith('criteria-1');
      expect(rankingValidationsService.existRankingCriteria).toHaveBeenCalledWith('criteria-2');
      expect(rankingValidationsService.existRankingCriteria).toHaveBeenCalledWith('criteria-3');
      expect(rankingScoreRepository.createMultipleRankingScores).toHaveBeenCalledTimes(1);
      expect(result.message).toBe('3 score(s) processado(s) com sucesso');
      expect(result.summary.created).toBe(3);
      expect(result.summary.updated).toBe(0);
      expect(result.summary.total).toBe(3);
      expect(result.results).toHaveLength(3);
    });

    it('should update existing scores and create new ones', async () => {
      const createMultipleScoresDto: CreateMultipleRankingItemScoresDto = {
        rankingItemId: 'item-id',
        userId: 'user-id',
        scores: [
          { rankingCriteriaId: 'criteria-1', score: 8.5 },
          { rankingCriteriaId: 'criteria-2', score: 9.0 },
        ],
      };

      const mockRankingItem = {
        id: 'item-id',
        rankingId: 'ranking-id',
        name: 'Test Item',
      };

      const existingScore = {
        id: 'existing-score-id',
        rankingItemId: 'item-id',
        userId: 'user-id',
        rankingCriteriaId: 'criteria-1',
        score: 7.0,
      };

      const mockUpdatedScore = {
        ...existingScore,
        score: 8.5,
        updatedAt: new Date(),
      };

      const mockCreatedScore = {
        id: 'new-score-id',
        rankingItemId: 'item-id',
        userId: 'user-id',
        rankingCriteriaId: 'criteria-2',
        score: 9.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRankingValidationsService.existRankingItem.mockResolvedValue(mockRankingItem);
      mockRankingValidationsService.existRankingCriteria.mockResolvedValue(undefined);
      mockRankingValidationsService.existRankingItemCriteriaScore
        .mockResolvedValueOnce(existingScore) // First score exists
        .mockResolvedValueOnce(null); // Second score doesn't exist
      mockRankingScoreRepository.updateMultipleRankingScores.mockResolvedValue([mockUpdatedScore]);
      mockRankingScoreRepository.createMultipleRankingScores.mockResolvedValue({ count: 1 });

      const result = await service.createMultipleRankingScores(createMultipleScoresDto);

      expect(rankingScoreRepository.updateMultipleRankingScores).toHaveBeenCalledTimes(1);
      expect(rankingScoreRepository.createMultipleRankingScores).toHaveBeenCalledTimes(1);
      expect(result.summary.created).toBe(1);
      expect(result.summary.updated).toBe(1);
      expect(result.summary.total).toBe(2);
    });

    it('should send push notification after processing all scores', async () => {
      const createMultipleScoresDto: CreateMultipleRankingItemScoresDto = {
        rankingItemId: 'item-id',
        userId: 'user-id',
        scores: [
          { rankingCriteriaId: 'criteria-1', score: 8.5 },
        ],
      };

      const mockRankingItem = {
        id: 'item-id',
        rankingId: 'ranking-id',
        name: 'Test Item',
      };

      const mockCreatedScore = {
        id: 'score-1',
        rankingItemId: 'item-id',
        userId: 'user-id',
        rankingCriteriaId: 'criteria-1',
        score: 8.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRankingValidationsService.existRankingItem.mockResolvedValue(mockRankingItem);
      mockRankingValidationsService.existRankingCriteria.mockResolvedValue(undefined);
      mockRankingValidationsService.existRankingItemCriteriaScore.mockResolvedValue(null);
      mockRankingScoreRepository.createMultipleRankingScores.mockResolvedValue({ count: 1 });
      mockRankingUserRepository.getRankingUsersPushTokens.mockResolvedValue(['token1', 'token2']);

      await service.createMultipleRankingScores(createMultipleScoresDto);

      expect(rankingUserRepository.getRankingUsersPushTokens).toHaveBeenCalledWith('ranking-id', 'user-id');
      expect(userRepository.findOne).toHaveBeenCalledWith({ id: 'user-id' });
      expect(expoPushService.sendBulkPushNotifications).toHaveBeenCalledWith(
        ['token1', 'token2'],
        'Item avaliado 📝',
        'Um item do ranking foi avaliado por Test User.',
      );
    });

    it('should handle push notification errors gracefully', async () => {
      const createMultipleScoresDto: CreateMultipleRankingItemScoresDto = {
        rankingItemId: 'item-id',
        userId: 'user-id',
        scores: [
          { rankingCriteriaId: 'criteria-1', score: 8.5 },
        ],
      };

      const mockRankingItem = {
        id: 'item-id',
        rankingId: 'ranking-id',
        name: 'Test Item',
      };

      const mockCreatedScore = {
        id: 'score-1',
        rankingItemId: 'item-id',
        userId: 'user-id',
        rankingCriteriaId: 'criteria-1',
        score: 8.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRankingValidationsService.existRankingItem.mockResolvedValue(mockRankingItem);
      mockRankingValidationsService.existRankingCriteria.mockResolvedValue(undefined);
      mockRankingValidationsService.existRankingItemCriteriaScore.mockResolvedValue(null);
      mockRankingScoreRepository.createMultipleRankingScores.mockResolvedValue({ count: 1 });
      mockRankingUserRepository.getRankingUsersPushTokens.mockRejectedValue(new Error('Push error'));

      // Should not throw error even if push notification fails
      const result = await service.createMultipleRankingScores(createMultipleScoresDto);

      expect(result.message).toBe('1 score(s) processado(s) com sucesso');
      expect(result.summary.total).toBe(1);
    });

    it('should throw error if ranking item does not exist', async () => {
      const createMultipleScoresDto: CreateMultipleRankingItemScoresDto = {
        rankingItemId: 'invalid-item-id',
        userId: 'user-id',
        scores: [
          { rankingCriteriaId: 'criteria-1', score: 8.5 },
        ],
      };

      mockRankingValidationsService.existRankingItem.mockRejectedValue(new Error('Item not found'));

      await expect(service.createMultipleRankingScores(createMultipleScoresDto)).rejects.toThrow();
    });

    it('should throw error if criteria does not exist', async () => {
      const createMultipleScoresDto: CreateMultipleRankingItemScoresDto = {
        rankingItemId: 'item-id',
        userId: 'user-id',
        scores: [
          { rankingCriteriaId: 'invalid-criteria-id', score: 8.5 },
        ],
      };

      const mockRankingItem = {
        id: 'item-id',
        rankingId: 'ranking-id',
        name: 'Test Item',
      };

      mockRankingValidationsService.existRankingItem.mockResolvedValue(mockRankingItem);
      mockRankingValidationsService.existRankingCriteria.mockRejectedValue(new Error('Criteria not found'));

      await expect(service.createMultipleRankingScores(createMultipleScoresDto)).rejects.toThrow();
    });
  });
}); 