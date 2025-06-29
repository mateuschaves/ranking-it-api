import { Test, TestingModule } from '@nestjs/testing';
import { RankingController } from './ranking.controller';
import { RankingService } from '../services/ranking.service';
import { RankingUserService } from '../services/ranking-user.service';
import { RankingInviteService } from '../services/ranking-invite.service';

describe('RankingController', () => {
  let controller: RankingController;

  beforeEach(async () => {
    const mockRankingService = {
      createRanking: jest.fn(),
      updateRanking: jest.fn(),
      suggestRankingCriteria: jest.fn(),
      getRankingCriteria: jest.fn(),
      createRankingCriteria: jest.fn(),
      removeRankingCriteria: jest.fn(),
    };

    const mockRankingUserService = {
      getAllRankingsByUserId: jest.fn(),
    };

    const mockRankingInviteService = {
      createRankingInvite: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RankingController],
      providers: [
        {
          provide: RankingService,
          useValue: mockRankingService,
        },
        {
          provide: RankingUserService,
          useValue: mockRankingUserService,
        },
        {
          provide: RankingInviteService,
          useValue: mockRankingInviteService,
        },
      ],
    }).compile();

    controller = module.get<RankingController>(RankingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
