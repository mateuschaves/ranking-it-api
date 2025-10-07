import { Test, TestingModule } from '@nestjs/testing';
import { RankingScoreController } from './ranking-score.controller';
import { RankingScoreService } from '../services/ranking-score.service';
import { AuthGuard } from '@nestjs/passport';
import CreateRankingItemScoreDto from '../dto/create-ranking-item-score.dto';
import CreateMultipleRankingItemScoresDto from '../dto/create-multiple-ranking-item-scores.dto';

describe('RankingScoreController', () => {
  let controller: RankingScoreController;
  let service: RankingScoreService;

  const mockRankingScoreService = {
    createRankingScore: jest.fn(),
    getRankingItemScores: jest.fn(),
    createMultipleRankingScores: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RankingScoreController],
      providers: [
        {
          provide: RankingScoreService,
          useValue: mockRankingScoreService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RankingScoreController>(RankingScoreController);
    service = module.get<RankingScoreService>(RankingScoreService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRankingScore', () => {
    it('should create a ranking score', async () => {
      const rankingId = 'ranking-id';
      const rankingItemId = 'item-id';
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

      mockRankingScoreService.createRankingScore.mockResolvedValue(expectedResult);

      const result = await controller.createRankingScore(rankingId, rankingItemId, createRankingScoreDto, 'user-id');

      expect(service.createRankingScore).toHaveBeenCalledWith(createRankingScoreDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getRankingScores', () => {
    it('should get ranking item scores', async () => {
      const rankingId = 'ranking-id';
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

      mockRankingScoreService.getRankingItemScores.mockResolvedValue(expectedResult);

      const result = await controller.getRankingScores(rankingId, rankingItemId);

      expect(service.getRankingItemScores).toHaveBeenCalledWith(rankingItemId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('createMultipleRankingScores', () => {
    it('should create multiple ranking scores', async () => {
      const rankingId = 'ranking-id';
      const rankingItemId = 'item-id';
      const createMultipleScoresDto: CreateMultipleRankingItemScoresDto = {
        rankingItemId: 'item-id',
        userId: 'user-id',
        scores: [
          { rankingCriteriaId: 'criteria-1', score: 8.5 },
          { rankingCriteriaId: 'criteria-2', score: 9.0 },
        ],
      };

      const expectedResult = {
        message: '2 score(s) processado(s) com sucesso',
        results: [
          {
            id: 'score-1',
            rankingItemId: 'item-id',
            userId: 'user-id',
            rankingCriteriaId: 'criteria-1',
            score: 8.5,
            createdAt: new Date(),
            updatedAt: new Date(),
            action: 'created',
          },
          {
            id: 'score-2',
            rankingItemId: 'item-id',
            userId: 'user-id',
            rankingCriteriaId: 'criteria-2',
            score: 9.0,
            createdAt: new Date(),
            updatedAt: new Date(),
            action: 'updated',
          },
        ],
        summary: {
          created: 1,
          updated: 1,
          total: 2,
        },
      };

      mockRankingScoreService.createMultipleRankingScores.mockResolvedValue(expectedResult);

      const result = await controller.createMultipleRankingScores(
        rankingId,
        rankingItemId,
        createMultipleScoresDto,
        'user-id'
      );

      expect(service.createMultipleRankingScores).toHaveBeenCalledWith({
        ...createMultipleScoresDto,
        rankingItemId: 'item-id',
        userId: 'user-id',
      });
      expect(result).toEqual(expectedResult);
    });

    it('should handle empty scores array', async () => {
      const rankingId = 'ranking-id';
      const rankingItemId = 'item-id';
      const createMultipleScoresDto: CreateMultipleRankingItemScoresDto = {
        rankingItemId: 'item-id',
        userId: 'user-id',
        scores: [],
      };

      const expectedResult = {
        message: '0 score(s) processado(s) com sucesso',
        results: [],
        summary: {
          created: 0,
          updated: 0,
          total: 0,
        },
      };

      mockRankingScoreService.createMultipleRankingScores.mockResolvedValue(expectedResult);

      const result = await controller.createMultipleRankingScores(
        rankingId,
        rankingItemId,
        createMultipleScoresDto,
        'user-id'
      );

      expect(service.createMultipleRankingScores).toHaveBeenCalledWith({
        ...createMultipleScoresDto,
        rankingItemId: 'item-id',
        userId: 'user-id',
      });
      expect(result).toEqual(expectedResult);
    });
  });
}); 