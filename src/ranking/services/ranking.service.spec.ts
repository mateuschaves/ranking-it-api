import { Test, TestingModule } from '@nestjs/testing';
import { RankingService } from './ranking.service';
import { RankingRepository } from '../repositories/ranking.repository';
import { RankingValidationsService } from './ranking-validations.service';
import { OpenAiService } from '../../ai/services/openai.service';
import { BucketService } from '../../shared/services/bucket.service';
import { BadRequestException } from '@nestjs/common';
import CreateRankingDto from '../dto/create-ranking.dto';
import UpdateRankingDto from '../dto/update-ranking.dto';

describe('RankingService', () => {
  let service: RankingService;
  let rankingRepository: jest.Mocked<RankingRepository>;
  let rankingValidationService: jest.Mocked<RankingValidationsService>;
  let openAiService: jest.Mocked<OpenAiService>;
  let bucketService: jest.Mocked<BucketService>;

  beforeEach(async () => {
    const mockRankingRepository = {
      createRanking: jest.fn(),
      updateRanking: jest.fn(),
      getRankingCriteria: jest.fn(),
      createRankingCriteria: jest.fn(),
      removeRankingCriteria: jest.fn(),
      deleteRanking: jest.fn(),
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
    rankingRepository = module.get(RankingRepository);
    rankingValidationService = module.get(RankingValidationsService);
    openAiService = module.get(OpenAiService);
    bucketService = module.get(BucketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRanking', () => {
    it('should create a ranking successfully', async () => {
      const createRankingDto: CreateRankingDto = {
        name: 'Test Ranking',
        description: 'Test Description',
        ownerId: 'user-123',
        hasGeolocation: true,
      };

      const mockUser = { 
        id: 'user-123', 
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        refreshToken: null,
        pushToken: null,
        avatarId: null,
      };
      const mockRanking = {
        id: 'ranking-123',
        name: 'Test Ranking',
        description: 'Test Description',
        hasGeolocation: true,
        ownerId: 'user-123',
        bannerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      rankingValidationService.existUser.mockResolvedValue(mockUser as any);
      rankingRepository.createRanking.mockResolvedValue(mockRanking as any);

      const result = await service.createRanking(createRankingDto);

      expect(rankingValidationService.existUser).toHaveBeenCalledWith('user-123');
      expect(rankingRepository.createRanking).toHaveBeenCalledWith({
        name: 'Test Ranking',
        ownerId: 'user-123',
        description: 'Test Description',
        hasGeolocation: true,
      });
      expect(result).toEqual(mockRanking);
    });

    it('should create a ranking with default hasGeolocation false', async () => {
      const createRankingDto: CreateRankingDto = {
        name: 'Test Ranking',
        description: 'Test Description',
        ownerId: 'user-123',
      };

      const mockUser = { 
        id: 'user-123', 
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        refreshToken: null,
        pushToken: null,
        avatarId: null,
      };
      const mockRanking = {
        id: 'ranking-123',
        name: 'Test Ranking',
        description: 'Test Description',
        hasGeolocation: false,
        ownerId: 'user-123',
        bannerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      rankingValidationService.existUser.mockResolvedValue(mockUser as any);
      rankingRepository.createRanking.mockResolvedValue(mockRanking as any);

      const result = await service.createRanking(createRankingDto);

      expect(rankingRepository.createRanking).toHaveBeenCalledWith({
        name: 'Test Ranking',
        ownerId: 'user-123',
        description: 'Test Description',
        hasGeolocation: false,
      });
      expect(result).toEqual(mockRanking);
    });

    it('should throw BadRequestException when user does not exist', async () => {
      const createRankingDto: CreateRankingDto = {
        name: 'Test Ranking',
        description: 'Test Description',
        ownerId: 'user-123',
      };

      rankingValidationService.existUser.mockRejectedValue(
        new BadRequestException('User not found'),
      );

      await expect(service.createRanking(createRankingDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when repository fails', async () => {
      const createRankingDto: CreateRankingDto = {
        name: 'Test Ranking',
        description: 'Test Description',
        ownerId: 'user-123',
      };

      const mockUser = { 
        id: 'user-123', 
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        refreshToken: null,
        pushToken: null,
        avatarId: null,
      };

      rankingValidationService.existUser.mockResolvedValue(mockUser as any);
      rankingRepository.createRanking.mockRejectedValue(new Error('Database error'));

      await expect(service.createRanking(createRankingDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateRanking', () => {
    it('should update a ranking successfully', async () => {
      const rankingId = 'ranking-123';
      const updateData: UpdateRankingDto = {
        name: 'Updated Ranking',
        description: 'Updated Description',
        hasGeolocation: true,
      };

      const mockRanking = {
        id: 'ranking-123',
        name: 'Updated Ranking',
        description: 'Updated Description',
        hasGeolocation: true,
        ownerId: 'user-123',
        bannerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      rankingValidationService.existRanking.mockResolvedValue(undefined as any);
      rankingRepository.updateRanking.mockResolvedValue(mockRanking as any);

      const result = await service.updateRanking(rankingId, updateData);

      expect(rankingValidationService.existRanking).toHaveBeenCalledWith(rankingId);
      expect(rankingRepository.updateRanking).toHaveBeenCalledWith(rankingId, updateData);
      expect(result).toEqual(mockRanking);
    });

    it('should update ranking with partial data', async () => {
      const rankingId = 'ranking-123';
      const updateData: UpdateRankingDto = {
        hasGeolocation: false,
      };

      const mockRanking = {
        id: 'ranking-123',
        name: 'Original Ranking',
        description: 'Original Description',
        hasGeolocation: false,
        ownerId: 'user-123',
        bannerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      rankingValidationService.existRanking.mockResolvedValue(undefined as any);
      rankingRepository.updateRanking.mockResolvedValue(mockRanking as any);

      const result = await service.updateRanking(rankingId, updateData);

      expect(rankingValidationService.existRanking).toHaveBeenCalledWith(rankingId);
      expect(rankingRepository.updateRanking).toHaveBeenCalledWith(rankingId, updateData);
      expect(result).toEqual(mockRanking);
    });

    it('should throw BadRequestException when ranking does not exist', async () => {
      const rankingId = 'ranking-123';
      const updateData: UpdateRankingDto = {
        name: 'Updated Ranking',
      };

      rankingValidationService.existRanking.mockRejectedValue(
        new BadRequestException('Ranking not found'),
      );

      await expect(service.updateRanking(rankingId, updateData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteRanking', () => {
    it('should delete a ranking successfully', async () => {
      const rankingId = 'ranking-123';
      const userId = 'user-123';
      const deletedAt = new Date();

      const mockDeletedRanking = {
        id: 'ranking-123',
        name: 'Deleted Ranking',
        description: 'Deleted Description',
        hasGeolocation: true,
        ownerId: 'user-123',
        bannerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt,
      };

      rankingValidationService.existRanking.mockResolvedValue(undefined as any);
      rankingValidationService.existRankingUser.mockResolvedValue(undefined as any);
      rankingRepository.deleteRanking.mockResolvedValue(mockDeletedRanking as any);

      const result = await service.deleteRanking(rankingId, userId);

      expect(rankingValidationService.existRanking).toHaveBeenCalledWith(rankingId);
      expect(rankingValidationService.existRankingUser).toHaveBeenCalledWith(rankingId, userId);
      expect(rankingRepository.deleteRanking).toHaveBeenCalledWith(rankingId);
      expect(result).toEqual(mockDeletedRanking);
    });

    it('should throw BadRequestException when ranking does not exist', async () => {
      const rankingId = 'ranking-123';
      const userId = 'user-123';

      rankingValidationService.existRanking.mockRejectedValue(
        new BadRequestException('Ranking não encontrado 😔'),
      );

      await expect(service.deleteRanking(rankingId, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when user is not part of ranking', async () => {
      const rankingId = 'ranking-123';
      const userId = 'user-123';

      rankingValidationService.existRanking.mockResolvedValue(undefined as any);
      rankingValidationService.existRankingUser.mockRejectedValue(
        new BadRequestException('Você não tem permissão para acessar esse recurso 😳'),
      );

      await expect(service.deleteRanking(rankingId, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when repository fails', async () => {
      const rankingId = 'ranking-123';
      const userId = 'user-123';

      rankingValidationService.existRanking.mockResolvedValue(undefined as any);
      rankingValidationService.existRankingUser.mockResolvedValue(undefined as any);
      rankingRepository.deleteRanking.mockRejectedValue(new Error('Database error'));

      await expect(service.deleteRanking(rankingId, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
