import { Test, TestingModule } from '@nestjs/testing';
import { RankingController } from './ranking.controller';
import { RankingService } from '../services/ranking.service';
import { RankingUserService } from '../services/ranking-user.service';
import { RankingInviteService } from '../services/ranking-invite.service';

describe('RankingController', () => {
  let controller: RankingController;
  let rankingUserService: RankingUserService;

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
      getRankingDetails: jest.fn(),
      removeMemberFromRanking: jest.fn(),
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
    rankingUserService = module.get<RankingUserService>(RankingUserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('removeMemberFromRanking', () => {
    it('should remove member from ranking', async () => {
      const rankingId = 'ranking-123';
      const memberId = 'user-456';
      const adminId = 'user-123';

      const expectedResult = {
        message: 'Membro removido com sucesso do ranking',
        removedUserId: memberId,
        rankingId,
      };

      (rankingUserService.removeMemberFromRanking as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.removeMemberFromRanking(rankingId, memberId, adminId);

      expect(rankingUserService.removeMemberFromRanking).toHaveBeenCalledWith(rankingId, memberId, adminId);
      expect(result).toEqual(expectedResult);
    });
  });
});
