import { Test, TestingModule } from '@nestjs/testing';
import { RankingInviteController } from './ranking-invite.controller';
import { RankingInviteService } from '../services/ranking-invite.service';
import { UserRepository } from '../../user/repositories/user.repository';
import { CreateRankingInviteDto } from '../dto/create-ranking-invite.dto';
import { AcceptRankingInviteDto } from '../dto/accept-ranking-invite.dto';
import { AuthGuard } from '@nestjs/passport';

describe('RankingInviteController', () => {
  let controller: RankingInviteController;
  let service: RankingInviteService;
  let userRepository: UserRepository;

  const mockRankingInviteService = {
    createRankingInvite: jest.fn(),
    acceptRankingInvite: jest.fn(),
    declineRankingInvite: jest.fn(),
    cancelRankingInvite: jest.fn(),
    getRankingInvitesByEmail: jest.fn(),
    getRankingInvitesByRankingId: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RankingInviteController],
      providers: [
        {
          provide: RankingInviteService,
          useValue: mockRankingInviteService,
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RankingInviteController>(RankingInviteController);
    service = module.get<RankingInviteService>(RankingInviteService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRankingInvite', () => {
    it('should create a ranking invite', async () => {
      const createInviteDto: CreateRankingInviteDto = {
        rankingId: 'ranking-id',
        email: 'invite@example.com',
      };

      const expectedResult = {
        id: 'invite-id',
        rankingId: 'ranking-id',
        email: 'invite@example.com',
        status: 'PENDING',
        invitedById: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRankingInviteService.createRankingInvite.mockResolvedValue(expectedResult);

      const result = await controller.createRankingInvite(createInviteDto, 'user-id');

      expect(service.createRankingInvite).toHaveBeenCalledWith(createInviteDto, 'user-id');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getMyRankingInvites', () => {
    it('should get user invites', async () => {
      const userId = 'user-id';
      const userEmail = 'test@example.com';

      mockUserRepository.findOne.mockResolvedValue({ ...mockUser, email: userEmail });

      const expectedResult = [
        {
          id: 'invite-id-1',
          rankingId: 'ranking-id-1',
          email: 'test@example.com',
          status: 'PENDING',
        },
        {
          id: 'invite-id-2',
          rankingId: 'ranking-id-2',
          email: 'test@example.com',
          status: 'PENDING',
        },
      ];

      mockRankingInviteService.getRankingInvitesByEmail.mockResolvedValue(expectedResult);

      const result = await controller.getMyRankingInvites(userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({ id: userId });
      expect(service.getRankingInvitesByEmail).toHaveBeenCalledWith(userEmail);
      expect(result).toEqual(expectedResult);
    });

    it('should throw error if user not found', async () => {
      const userId = 'user-id';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(controller.getMyRankingInvites(userId)).rejects.toThrow('User not found');
    });
  });

  describe('getRankingInvitesByRankingId', () => {
    it('should get invites by ranking', async () => {
      const rankingId = 'ranking-id';
      const userId = 'user-id';

      const expectedResult = [
        {
          id: 'invite-id-1',
          rankingId: 'ranking-id',
          email: 'user1@example.com',
          status: 'PENDING',
        },
        {
          id: 'invite-id-2',
          rankingId: 'ranking-id',
          email: 'user2@example.com',
          status: 'ACCEPTED',
        },
      ];

      mockRankingInviteService.getRankingInvitesByRankingId.mockResolvedValue(expectedResult);

      const result = await controller.getRankingInvitesByRankingId(rankingId, userId);

      expect(service.getRankingInvitesByRankingId).toHaveBeenCalledWith(rankingId, userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('acceptRankingInvite', () => {
    it('should accept a ranking invite', async () => {
      const acceptInviteDto: AcceptRankingInviteDto = {
        inviteId: 'invite-id',
      };

      const expectedResult = {
        id: 'invite-id',
        status: 'ACCEPTED',
        rankingId: 'ranking-id',
        email: 'invite@example.com',
      };

      mockRankingInviteService.acceptRankingInvite.mockResolvedValue(expectedResult);

      const result = await controller.acceptRankingInvite(acceptInviteDto, 'user-id');

      expect(service.acceptRankingInvite).toHaveBeenCalledWith(acceptInviteDto, 'user-id');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('declineRankingInvite', () => {
    it('should decline a ranking invite', async () => {
      const inviteId = 'invite-id';
      const userId = 'user-id';

      const expectedResult = {
        id: 'invite-id',
        status: 'DECLINED',
        rankingId: 'ranking-id',
        email: 'invite@example.com',
      };

      mockRankingInviteService.declineRankingInvite.mockResolvedValue(expectedResult);

      const result = await controller.declineRankingInvite(inviteId, userId);

      expect(service.declineRankingInvite).toHaveBeenCalledWith(inviteId, userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('cancelRankingInvite', () => {
    it('should cancel a ranking invite', async () => {
      const inviteId = 'invite-id';
      const userId = 'user-id';

      const expectedResult = {
        id: 'invite-id',
        status: 'CANCELLED',
        rankingId: 'ranking-id',
        email: 'invite@example.com',
      };

      mockRankingInviteService.cancelRankingInvite.mockResolvedValue(expectedResult);

      const result = await controller.cancelRankingInvite(inviteId, userId);

      expect(service.cancelRankingInvite).toHaveBeenCalledWith(inviteId, userId);
      expect(result).toEqual(expectedResult);
    });
  });
}); 