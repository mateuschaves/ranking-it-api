import { Test, TestingModule } from '@nestjs/testing';
import { RankingService } from './ranking.service';
import { RankingRepository } from '../repositories/ranking.repository';
import { RankingValidationsService } from './ranking-validations.service';
import { OpenAiService } from '../../ai/services/openai.service';
import { BucketService } from '../../shared/services/bucket.service';

describe('RankingService', () => {
  let service: RankingService;

  beforeEach(async () => {
    const mockRankingRepository = {
      createRanking: jest.fn(),
      updateRanking: jest.fn(),
      getRankingCriteria: jest.fn(),
      createRankingCriteria: jest.fn(),
      removeRankingCriteria: jest.fn(),
    };

    const mockRankingValidationService = {
      existUser: jest.fn(),
      existRanking: jest.fn(),
      existRankingUser: jest.fn(),
    };

    const mockOpenAiService = {
      createCompletion: jest.fn(),
    };

    const mockBucketService = {
      uploadFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RankingService,
        {
          provide: RankingRepository,
          useValue: mockRankingRepository,
        },
        {
          provide: RankingValidationsService,
          useValue: mockRankingValidationService,
        },
        {
          provide: OpenAiService,
          useValue: mockOpenAiService,
        },
        {
          provide: BucketService,
          useValue: mockBucketService,
        },
      ],
    }).compile();

    service = module.get<RankingService>(RankingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
