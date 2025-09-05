import { Test, TestingModule } from '@nestjs/testing';
import { RankingScoreService } from './ranking-score.service';
import { RankingScoreRepository } from '../repositories/ranking-score.repository';
import { RankingValidationsService } from './ranking-validations.service';
import CreateRankingItemScoreDto from '../dto/create-ranking-item-score.dto';
import { RankingUserRepository } from '../repositories/ranking-user.repository';
import { ExpoPushService } from 'src/shared/services/expo-push.service';

describe('RankingScoreService', () => {
  let service: RankingScoreService;
  let rankingScoreRepository: RankingScoreRepository;
  let rankingValidationsService: RankingValidationsService;
  let rankingUserRepository: RankingUserRepository;
  let expoPushService: ExpoPushService;

  const mockRankingScoreRepository = {
    createRankingScore: jest.fn(),
    getRankingScores: jest.fn(),
    getRankingScoreById: jest.fn(),
    updateRankingScore: jest.fn(),
    deleteRankingScore: jest.fn(),
    getAvgRankingItemScore: jest.fn(),
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
      ],
    }).compile();

    service = module.get<RankingScoreService>(RankingScoreService);
    rankingScoreRepository = module.get<RankingScoreRepository>(RankingScoreRepository);
    rankingValidationsService = module.get<RankingValidationsService>(RankingValidationsService);
    rankingUserRepository = module.get<RankingUserRepository>(RankingUserRepository);
    expoPushService = module.get<ExpoPushService>(ExpoPushService);
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
}); 