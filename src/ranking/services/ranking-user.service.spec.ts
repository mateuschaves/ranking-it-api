import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { RankingUserService } from './ranking-user.service';
import { RankingUserRepository } from '../repositories/ranking-user.repository';
import { RankingValidationsService } from './ranking-validations.service';

describe('RankingUserService', () => {
  let service: RankingUserService;
  let rankingUserRepository: RankingUserRepository;
  let rankingValidationService: RankingValidationsService;

  beforeEach(async () => {
    const mockRankingUserRepository = {
      getAllRankingsByUserId: jest.fn(),
      getRankingDetails: jest.fn(),
      removeUserFromRanking: jest.fn(),
      isRankingOwner: jest.fn(),
    };

    const mockRankingValidationService = {
      existUser: jest.fn(),
      existRanking: jest.fn(),
      existRankingUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RankingUserService,
        {
          provide: RankingUserRepository,
          useValue: mockRankingUserRepository,
        },
        {
          provide: RankingValidationsService,
          useValue: mockRankingValidationService,
        },
      ],
    }).compile();

    service = module.get<RankingUserService>(RankingUserService);
    rankingUserRepository = module.get<RankingUserRepository>(RankingUserRepository);
    rankingValidationService = module.get<RankingValidationsService>(RankingValidationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllRankingsByUserId', () => {
    it('should return rankings with createdBy field', async () => {
      const mockRankings = [
        {
          id: 'ranking-123',
          name: 'Ranking XPTO',
          description: 'Descrição do ranking',
          banner: 'http://ranking-attachments.s3.us-east-1.amazonaws.com/banner.jpg',
          createdAt: new Date('2024-07-01T12:00:00.000Z'),
          owner: {
            id: 'user-123',
            name: 'John Doe',
            email: 'john.doe@example.com',
            avatar: {
              url: 'http://ranking-attachments.s3.us-east-1.amazonaws.com/avatar.jpg',
            },
          },
          rankingCriteria: [
            { name: 'Qualidade' },
            { name: 'Preço' },
            { name: 'Localização' },
            { name: 'Atendimento' },
          ],
        },
      ];

      (rankingValidationService.existUser as jest.Mock).mockResolvedValue({ id: 'user-123' });
      // Mock do repositório retornando dados já processados (como o repositório real faz)
      (rankingUserRepository.getAllRankingsByUserId as jest.Mock).mockResolvedValue([
        {
          id: 'ranking-123',
          name: 'Ranking XPTO',
          description: 'Descrição do ranking',
          banner: 'http://ranking-attachments.s3.us-east-1.amazonaws.com/banner.jpg',
          createdAt: new Date('2024-07-01T12:00:00.000Z'),
          owner: {
            id: 'user-123',
            name: 'John Doe',
            email: 'john.doe@example.com',
            avatar: {
              url: 'http://ranking-attachments.s3.us-east-1.amazonaws.com/avatar.jpg',
            },
          },
          criteria: ['Qualidade', 'Preço', 'Localização', 'Atendimento'],
        },
      ]);

      const result = await service.getAllRankingsByUserId('user-123');

      expect(result).toEqual([
        {
          id: 'ranking-123',
          name: 'Ranking XPTO',
          description: 'Descrição do ranking',
          banner: 'http://ranking-attachments.s3.us-east-1.amazonaws.com/banner.jpg',
          createdAt: new Date('2024-07-01T12:00:00.000Z'),
          owner: {
            id: 'user-123',
            name: 'John Doe',
            email: 'john.doe@example.com',
            avatar: {
              url: 'http://ranking-attachments.s3.us-east-1.amazonaws.com/avatar.jpg',
            },
          },
          createdBy: {
            id: 'user-123',
            name: 'John Doe',
            email: 'john.doe@example.com',
            avatar: {
              url: 'http://ranking-attachments.s3.us-east-1.amazonaws.com/avatar.jpg',
            },
          },
          criteria: ['Qualidade', 'Preço', 'Localização', 'Atendimento'],
        },
      ]);
    });
  describe('getRankingDetails', () => {
    it('should return ranking details with members and invites', async () => {
      const mockRankingDetails = {
        id: 'ranking-123',
        name: 'Test Ranking',
        description: 'Test Description',
        banner: 'http://example.com/banner.jpg',
        createdAt: new Date(),
        owner: {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: { url: 'http://example.com/avatar.jpg' },
        },
        members: [
          {
            id: 'user-123',
            name: 'John Doe',
            email: 'john@example.com',
            avatar: { url: 'http://example.com/avatar.jpg' },
            joinedAt: new Date(),
          },
        ],
        pendingInvites: [
          {
            id: 'invite-123',
            email: 'pending@example.com',
            createdAt: new Date(),
            invitedBy: {
              id: 'user-123',
              name: 'John Doe',
              avatar: { url: 'http://example.com/avatar.jpg' },
            },
          },
        ],
        criteria: [
          { id: 'criteria-1', name: 'Quality' },
        ],
      };

      (rankingUserRepository.getRankingDetails as jest.Mock).mockResolvedValue(mockRankingDetails);
      (rankingValidationService.existRanking as jest.Mock).mockResolvedValue({ id: 'ranking-123' });
      (rankingValidationService.existRankingUser as jest.Mock).mockResolvedValue(true);

      const result = await service.getRankingDetails('ranking-123', 'user-123');

      expect(result).toEqual(mockRankingDetails);
      expect(rankingValidationService.existRanking).toHaveBeenCalledWith('ranking-123');
      expect(rankingValidationService.existRankingUser).toHaveBeenCalledWith('ranking-123', 'user-123');
      expect(rankingUserRepository.getRankingDetails).toHaveBeenCalledWith('ranking-123');
    });

    it('should throw BadRequestException when ranking not found', async () => {
      (rankingValidationService.existRanking as jest.Mock).mockResolvedValue({ id: 'ranking-123' });
      (rankingValidationService.existRankingUser as jest.Mock).mockResolvedValue(true);
      (rankingUserRepository.getRankingDetails as jest.Mock).mockResolvedValue(null);

      await expect(service.getRankingDetails('ranking-123', 'user-123')).rejects.toThrow(
        new BadRequestException('Ranking não encontrado 😔')
      );
    });

    it('should throw BadRequestException when user is not member', async () => {
      (rankingValidationService.existRanking as jest.Mock).mockResolvedValue({ id: 'ranking-123' });
      (rankingValidationService.existRankingUser as jest.Mock).mockRejectedValue(
        new BadRequestException('User not member')
      );

      await expect(service.getRankingDetails('ranking-123', 'user-123')).rejects.toThrow(
        new BadRequestException('User not member')
      );
    });
  });

  describe('removeMemberFromRanking', () => {
    it('should remove member from ranking successfully', async () => {
      const rankingId = 'ranking-123';
      const memberId = 'user-456';
      const adminId = 'user-123';

      (rankingValidationService.existRanking as jest.Mock).mockResolvedValue({ id: rankingId });
      (rankingUserRepository.isRankingOwner as jest.Mock).mockResolvedValue(true);
      (rankingValidationService.existRankingUser as jest.Mock).mockResolvedValue(true);
      (rankingUserRepository.removeUserFromRanking as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await service.removeMemberFromRanking(rankingId, memberId, adminId);

      expect(result).toEqual({
        message: 'Membro removido com sucesso do ranking',
        removedUserId: memberId,
        rankingId,
      });
      expect(rankingValidationService.existRanking).toHaveBeenCalledWith(rankingId);
      expect(rankingUserRepository.isRankingOwner).toHaveBeenCalledWith(rankingId, adminId);
      expect(rankingValidationService.existRankingUser).toHaveBeenCalledWith(rankingId, memberId);
      expect(rankingUserRepository.removeUserFromRanking).toHaveBeenCalledWith(rankingId, memberId);
    });

    it('should throw BadRequestException when admin is not ranking owner', async () => {
      const rankingId = 'ranking-123';
      const memberId = 'user-456';
      const adminId = 'user-123';

      (rankingValidationService.existRanking as jest.Mock).mockResolvedValue({ id: rankingId });
      (rankingUserRepository.isRankingOwner as jest.Mock).mockResolvedValue(false);

      await expect(service.removeMemberFromRanking(rankingId, memberId, adminId)).rejects.toThrow(
        new BadRequestException('Apenas o proprietário do ranking pode remover membros 😔')
      );
    });

    it('should throw BadRequestException when admin tries to remove self', async () => {
      const rankingId = 'ranking-123';
      const adminId = 'user-123';

      (rankingValidationService.existRanking as jest.Mock).mockResolvedValue({ id: rankingId });
      (rankingUserRepository.isRankingOwner as jest.Mock).mockResolvedValue(true);

      await expect(service.removeMemberFromRanking(rankingId, adminId, adminId)).rejects.toThrow(
        new BadRequestException('Você não pode remover a si mesmo do ranking 😔')
      );
    });

    it('should throw BadRequestException when user not found in ranking', async () => {
      const rankingId = 'ranking-123';
      const memberId = 'user-456';
      const adminId = 'user-123';

      (rankingValidationService.existRanking as jest.Mock).mockResolvedValue({ id: rankingId });
      (rankingUserRepository.isRankingOwner as jest.Mock).mockResolvedValue(true);
      (rankingValidationService.existRankingUser as jest.Mock).mockResolvedValue(true);
      (rankingUserRepository.removeUserFromRanking as jest.Mock).mockResolvedValue({ count: 0 });

      await expect(service.removeMemberFromRanking(rankingId, memberId, adminId)).rejects.toThrow(
        new BadRequestException('Usuário não encontrado no ranking 😔')
      );
    });
  });
});
}); 