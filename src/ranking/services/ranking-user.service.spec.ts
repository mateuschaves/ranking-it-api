import { Test, TestingModule } from '@nestjs/testing';
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
    };

    const mockRankingValidationService = {
      existUser: jest.fn(),
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
        },
      ];

      (rankingValidationService.existUser as jest.Mock).mockResolvedValue({ id: 'user-123' });
      (rankingUserRepository.getAllRankingsByUserId as jest.Mock).mockResolvedValue(mockRankings);

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
        },
      ]);
    });
  });
}); 