import { Test, TestingModule } from '@nestjs/testing';
import { RankingItemService } from './ranking-item.service';
import { RankingItemRepository } from '../repositories/ranking-item.repository';
import { RankingScoreRepository } from '../repositories/ranking-score.repository';
import { RankingValidationsService } from './ranking-validations.service';
import CreateRankingItemDto from '../dto/create-ranking-item.dto';
import { RankingUserRepository } from '../repositories/ranking-user.repository';
import { ExpoPushService } from 'src/shared/services/expo-push.service';

describe('RankingItemService', () => {
  let service: RankingItemService;
  let rankingItemRepository: RankingItemRepository;
  let rankingScoreRepository: RankingScoreRepository;
  let rankingValidationsService: RankingValidationsService;
  let rankingUserRepository: RankingUserRepository;
  let expoPushService: ExpoPushService;

  const mockRankingItemRepository = {
    createRankingItem: jest.fn(),
    getRankingItems: jest.fn(),
    getRankingItemById: jest.fn(),
    deleteRankingItem: jest.fn(),
    createRankingItemUserPhoto: jest.fn(),
    updateRankingItem: jest.fn(),
    getRankingItemUserPhotosByUser: jest.fn(),
    deleteRankingItemUserPhotos: jest.fn(),
  };

  const mockRankingScoreRepository = {
    getAvgRankingItemScore: jest.fn(),
  };

  const mockRankingValidationsService = {
    existUser: jest.fn(),
    existRankingUser: jest.fn(),
    existRanking: jest.fn(),
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
        RankingItemService,
        {
          provide: RankingItemRepository,
          useValue: mockRankingItemRepository,
        },
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

    service = module.get<RankingItemService>(RankingItemService);
    rankingItemRepository = module.get<RankingItemRepository>(RankingItemRepository);
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

  describe('createRankingItem', () => {
    it('should create a ranking item', async () => {
      const createRankingItemDto: CreateRankingItemDto = {
        rankingId: 'ranking-id',
        name: 'Test Item',
        description: 'Test Description',
        createdById: 'user-id',
        photos: ['photo-1', 'photo-2'],
      };

      const expectedResult = {
        id: 'item-id',
        rankingId: 'ranking-id',
        name: 'Test Item',
        description: 'Test Description',
        createdById: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRankingValidationsService.existUser.mockResolvedValue(undefined);
      mockRankingValidationsService.existRankingUser.mockResolvedValue(undefined);
      mockRankingItemRepository.createRankingItem.mockResolvedValue(expectedResult);
      mockRankingItemRepository.createRankingItemUserPhoto.mockResolvedValue({} as any);

      const result = await service.createRankingItem(createRankingItemDto);

      expect(rankingValidationsService.existUser).toHaveBeenCalledWith('user-id');
      expect(rankingValidationsService.existRankingUser).toHaveBeenCalledWith('ranking-id', 'user-id');
      expect(rankingItemRepository.createRankingItem).toHaveBeenCalledWith({
        name: 'Test Item',
        description: 'Test Description',
        link: undefined,
        latitude: null,
        longitude: null,
        rankingId: 'ranking-id',
        createdById: 'user-id',
      });
      expect(result).toEqual(expectedResult);
    });

    it('should create ranking item without photos', async () => {
      const createRankingItemDto: CreateRankingItemDto = {
        rankingId: 'ranking-id',
        name: 'Test Item',
        description: 'Test Description',
        createdById: 'user-id',
      };

      const expectedResult = {
        id: 'item-id',
        rankingId: 'ranking-id',
        name: 'Test Item',
        description: 'Test Description',
        createdById: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRankingValidationsService.existUser.mockResolvedValue(undefined);
      mockRankingValidationsService.existRankingUser.mockResolvedValue(undefined);
      mockRankingItemRepository.createRankingItem.mockResolvedValue(expectedResult);

      const result = await service.createRankingItem(createRankingItemDto);

      expect(rankingItemRepository.createRankingItem).toHaveBeenCalledWith({
        name: 'Test Item',
        description: 'Test Description',
        link: undefined,
        latitude: null,
        longitude: null,
        rankingId: 'ranking-id',
        createdById: 'user-id',
      });
      expect(result).toEqual(expectedResult);
    });

    it('should create a ranking item with geolocation', async () => {
      const createRankingItemDto: CreateRankingItemDto = {
        rankingId: 'ranking-id',
        name: 'Test Item with Location',
        description: 'Test Description',
        createdById: 'user-id',
        latitude: '-23.5505',
        longitude: '-46.6333',
        link: 'https://example.com',
      };

      const expectedResult = {
        id: 'item-id',
        rankingId: 'ranking-id',
        name: 'Test Item with Location',
        description: 'Test Description',
        createdById: 'user-id',
        latitude: -23.5505,
        longitude: -46.6333,
        link: 'https://example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRankingValidationsService.existUser.mockResolvedValue(undefined);
      mockRankingValidationsService.existRankingUser.mockResolvedValue(undefined);
      mockRankingItemRepository.createRankingItem.mockResolvedValue(expectedResult);

      const result = await service.createRankingItem(createRankingItemDto);

      expect(rankingValidationsService.existUser).toHaveBeenCalledWith('user-id');
      expect(rankingValidationsService.existRankingUser).toHaveBeenCalledWith('ranking-id', 'user-id');
      expect(rankingItemRepository.createRankingItem).toHaveBeenCalledWith({
        name: 'Test Item with Location',
        description: 'Test Description',
        link: 'https://example.com',
        latitude: -23.5505,
        longitude: -46.6333,
        rankingId: 'ranking-id',
        createdById: 'user-id',
      });
      expect(result).toEqual(expectedResult);
    });

    it('should create a ranking item with null geolocation when not provided', async () => {
      const createRankingItemDto: CreateRankingItemDto = {
        rankingId: 'ranking-id',
        name: 'Test Item without Location',
        description: 'Test Description',
        createdById: 'user-id',
      };

      const expectedResult = {
        id: 'item-id',
        rankingId: 'ranking-id',
        name: 'Test Item without Location',
        description: 'Test Description',
        createdById: 'user-id',
        latitude: null,
        longitude: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRankingValidationsService.existUser.mockResolvedValue(undefined);
      mockRankingValidationsService.existRankingUser.mockResolvedValue(undefined);
      mockRankingItemRepository.createRankingItem.mockResolvedValue(expectedResult);

      const result = await service.createRankingItem(createRankingItemDto);

      expect(rankingItemRepository.createRankingItem).toHaveBeenCalledWith({
        name: 'Test Item without Location',
        description: 'Test Description',
        link: undefined,
        latitude: null,
        longitude: null,
        rankingId: 'ranking-id',
        createdById: 'user-id',
      });
      expect(result).toEqual(expectedResult);
    });

    it('should create a ranking item with empty string geolocation', async () => {
      const createRankingItemDto: CreateRankingItemDto = {
        rankingId: 'ranking-id',
        name: 'Test Item with Empty Location',
        description: 'Test Description',
        createdById: 'user-id',
        latitude: '',
        longitude: '',
      };

      const expectedResult = {
        id: 'item-id',
        rankingId: 'ranking-id',
        name: 'Test Item with Empty Location',
        description: 'Test Description',
        createdById: 'user-id',
        latitude: null,
        longitude: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRankingValidationsService.existUser.mockResolvedValue(undefined);
      mockRankingValidationsService.existRankingUser.mockResolvedValue(undefined);
      mockRankingItemRepository.createRankingItem.mockResolvedValue(expectedResult);

      const result = await service.createRankingItem(createRankingItemDto);

      expect(rankingItemRepository.createRankingItem).toHaveBeenCalledWith({
        name: 'Test Item with Empty Location',
        description: 'Test Description',
        link: undefined,
        latitude: null,
        longitude: null,
        rankingId: 'ranking-id',
        createdById: 'user-id',
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getRankingItems', () => {
    it('should get ranking items with scores', async () => {
      const rankingId = 'ranking-id';
      const userId = 'user-id';

      const mockItems = [
        {
          id: 'item-id-1',
          name: 'Item 1',
          description: 'Description 1',
        },
        {
          id: 'item-id-2',
          name: 'Item 2',
          description: 'Description 2',
        },
      ];

      const expectedResult = [
        {
          id: 'item-id-1',
          name: 'Item 1',
          description: 'Description 1',
          score: 8.5,
        },
        {
          id: 'item-id-2',
          name: 'Item 2',
          description: 'Description 2',
          score: 7.2,
        },
      ];

      mockRankingValidationsService.existRanking.mockResolvedValue(undefined);
      mockRankingValidationsService.existRankingUser.mockResolvedValue(undefined);
      mockRankingItemRepository.getRankingItems.mockResolvedValue(mockItems);
      mockRankingScoreRepository.getAvgRankingItemScore
        .mockResolvedValueOnce({ score: 8.5 })
        .mockResolvedValueOnce({ score: 7.2 });

      const result = await service.getRankingItems(rankingId, userId);

      expect(rankingValidationsService.existRanking).toHaveBeenCalledWith(rankingId);
      expect(rankingValidationsService.existRankingUser).toHaveBeenCalledWith(rankingId, userId);
      expect(rankingItemRepository.getRankingItems).toHaveBeenCalledWith(rankingId);
      expect(result).toEqual(expectedResult);
    });

    it('should handle items with no scores', async () => {
      const rankingId = 'ranking-id';
      const userId = 'user-id';

      const mockItems = [
        {
          id: 'item-id-1',
          name: 'Item 1',
          description: 'Description 1',
        },
      ];

      const expectedResult = [
        {
          id: 'item-id-1',
          name: 'Item 1',
          description: 'Description 1',
          score: 0,
        },
      ];

      mockRankingValidationsService.existRanking.mockResolvedValue(undefined);
      mockRankingValidationsService.existRankingUser.mockResolvedValue(undefined);
      mockRankingItemRepository.getRankingItems.mockResolvedValue(mockItems);
      mockRankingScoreRepository.getAvgRankingItemScore.mockResolvedValue({ score: null });

      const result = await service.getRankingItems(rankingId, userId);

      expect(result[0].score).toBe(0);
    });

    it('should convert decimal/string average score to number', async () => {
      const rankingId = 'ranking-id';
      const userId = 'user-id';

      const mockItems = [
        { id: 'item-id-1', name: 'Item 1', description: 'Description 1' },
      ];

      const expectedResult = [
        { id: 'item-id-1', name: 'Item 1', description: 'Description 1', score: 8.5 },
      ];

      mockRankingValidationsService.existRanking.mockResolvedValue(undefined);
      mockRankingValidationsService.existRankingUser.mockResolvedValue(undefined);
      mockRankingItemRepository.getRankingItems.mockResolvedValue(mockItems);
      // Simulate Prisma Decimal/string-like value
      mockRankingScoreRepository.getAvgRankingItemScore.mockResolvedValue({ score: '8.5' } as any);

      const result = await service.getRankingItems(rankingId, userId);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('deleteRankingItem', () => {
    it('should delete a ranking item', async () => {
      const rankingItemId = 'item-id';
      const userId = 'user-id';

      const mockItem = {
        id: 'item-id',
        rankingId: 'ranking-id',
        name: 'Test Item',
        description: 'Test Description',
      };

      mockRankingItemRepository.getRankingItemById.mockResolvedValue(mockItem);
      mockRankingValidationsService.existRankingUser.mockResolvedValue(undefined);
      mockRankingItemRepository.deleteRankingItem.mockResolvedValue(undefined);

      await service.deleteRankingItem(rankingItemId, userId);

      expect(rankingItemRepository.getRankingItemById).toHaveBeenCalledWith(rankingItemId);
      expect(rankingValidationsService.existRankingUser).toHaveBeenCalledWith('ranking-id', userId);
      expect(rankingItemRepository.deleteRankingItem).toHaveBeenCalledWith(rankingItemId);
    });

    it('should throw error if item not found', async () => {
      const rankingItemId = 'item-id';
      const userId = 'user-id';

      mockRankingItemRepository.getRankingItemById.mockResolvedValue(null);

      await expect(service.deleteRankingItem(rankingItemId, userId)).rejects.toThrow('Item do ranking não encontrado 😔');
    });
  });

  describe('updateRankingItem', () => {
    it('should update a ranking item', async () => {
      const rankingId = 'ranking-id';
      const rankingItemId = 'item-id';
      const userId = 'user-id';
      const updateDto = { name: 'Updated' } as any;

      const mockItem = {
        id: rankingItemId,
        rankingId,
      } as any;

      const expected = { id: rankingItemId, name: 'Updated' } as any;

      mockRankingItemRepository.getRankingItemById.mockResolvedValue(mockItem);
      mockRankingValidationsService.existRankingUser.mockResolvedValue(undefined);
      mockRankingItemRepository.updateRankingItem.mockResolvedValue(expected);

      const result = await service.updateRankingItem(
        rankingId,
        rankingItemId,
        userId,
        updateDto,
      );

      expect(result).toEqual(expected);
      expect(rankingItemRepository.updateRankingItem).toHaveBeenCalled();
    });

    it('should update a ranking item with geolocation', async () => {
      const rankingId = 'ranking-id';
      const rankingItemId = 'item-id';
      const userId = 'user-id';
      const updateDto = {
        name: 'Updated Item',
        latitude: '-23.5505',
        longitude: '-46.6333',
      } as any;

      const mockItem = {
        id: rankingItemId,
        rankingId,
      } as any;

      const expected = {
        id: rankingItemId,
        name: 'Updated Item',
        latitude: -23.5505,
        longitude: -46.6333,
      } as any;

      mockRankingItemRepository.getRankingItemById.mockResolvedValue(mockItem);
      mockRankingValidationsService.existRankingUser.mockResolvedValue(undefined);
      mockRankingItemRepository.updateRankingItem.mockResolvedValue(expected);

      const result = await service.updateRankingItem(
        rankingId,
        rankingItemId,
        userId,
        updateDto,
      );

      expect(rankingItemRepository.updateRankingItem).toHaveBeenCalledWith(rankingItemId, {
        name: 'Updated Item',
        description: undefined,
        link: undefined,
        latitude: -23.5505,
        longitude: -46.6333,
      });
      expect(result).toEqual(expected);
    });

    it('should update a ranking item with null geolocation when not provided', async () => {
      const rankingId = 'ranking-id';
      const rankingItemId = 'item-id';
      const userId = 'user-id';
      const updateDto = {
        name: 'Updated Item',
        description: 'Updated description',
      } as any;

      const mockItem = {
        id: rankingItemId,
        rankingId,
      } as any;

      const expected = {
        id: rankingItemId,
        name: 'Updated Item',
        description: 'Updated description',
        latitude: null,
        longitude: null,
      } as any;

      mockRankingItemRepository.getRankingItemById.mockResolvedValue(mockItem);
      mockRankingValidationsService.existRankingUser.mockResolvedValue(undefined);
      mockRankingItemRepository.updateRankingItem.mockResolvedValue(expected);

      const result = await service.updateRankingItem(
        rankingId,
        rankingItemId,
        userId,
        updateDto,
      );

      expect(rankingItemRepository.updateRankingItem).toHaveBeenCalledWith(rankingItemId, {
        name: 'Updated Item',
        description: 'Updated description',
        link: undefined,
        latitude: null,
        longitude: null,
      });
      expect(result).toEqual(expected);
    });

    it('should update a ranking item with empty string geolocation', async () => {
      const rankingId = 'ranking-id';
      const rankingItemId = 'item-id';
      const userId = 'user-id';
      const updateDto = {
        name: 'Updated Item',
        latitude: '',
        longitude: '',
      } as any;

      const mockItem = {
        id: rankingItemId,
        rankingId,
      } as any;

      const expected = {
        id: rankingItemId,
        name: 'Updated Item',
        latitude: null,
        longitude: null,
      } as any;

      mockRankingItemRepository.getRankingItemById.mockResolvedValue(mockItem);
      mockRankingValidationsService.existRankingUser.mockResolvedValue(undefined);
      mockRankingItemRepository.updateRankingItem.mockResolvedValue(expected);

      const result = await service.updateRankingItem(
        rankingId,
        rankingItemId,
        userId,
        updateDto,
      );

      expect(rankingItemRepository.updateRankingItem).toHaveBeenCalledWith(rankingItemId, {
        name: 'Updated Item',
        description: undefined,
        link: undefined,
        latitude: null,
        longitude: null,
      });
      expect(result).toEqual(expected);
    });

    it('should throw if item not found', async () => {
      mockRankingItemRepository.getRankingItemById.mockResolvedValue(null);
      await expect(
        service.updateRankingItem('ranking-id', 'item-id', 'user-id', {} as any),
      ).rejects.toThrow('Item do ranking não encontrado 😔');
    });

    it('should throw if item does not belong to ranking', async () => {
      const rankingId = 'ranking-id';
      const rankingItemId = 'item-id';
      const userId = 'user-id';
      const updateDto = { name: 'Updated' } as any;

      const mockItem = {
        id: rankingItemId,
        rankingId: 'different-ranking-id',
      } as any;

      mockRankingItemRepository.getRankingItemById.mockResolvedValue(mockItem);

      await expect(
        service.updateRankingItem(rankingId, rankingItemId, userId, updateDto),
      ).rejects.toThrow('Item não pertence a este ranking 😔');
    });

    it('should sync photos: add new and remove missing', async () => {
      const rankingId = 'ranking-id';
      const rankingItemId = 'item-id';
      const userId = 'user-id';
      const updateDto = { photos: ['a', 'b', 'c'] } as any;

      const mockItem = { id: rankingItemId, rankingId } as any;
      mockRankingItemRepository.getRankingItemById.mockResolvedValue(mockItem);
      mockRankingValidationsService.existRankingUser.mockResolvedValue(undefined);
      mockRankingItemRepository.updateRankingItem.mockResolvedValue({ id: rankingItemId });

      // Existing: a, x
      mockRankingItemRepository.getRankingItemUserPhotosByUser.mockResolvedValue(['a', 'x']);

      const result = await service.updateRankingItem(
        rankingId,
        rankingItemId,
        userId,
        updateDto,
      );

      // Should add b and c
      expect(mockRankingItemRepository.createRankingItemUserPhoto).toHaveBeenCalledTimes(2);
      // Should remove x
      expect(mockRankingItemRepository.deleteRankingItemUserPhotos).toHaveBeenCalledWith(
        rankingItemId,
        userId,
        ['x'],
      );
      expect(result).toEqual({ id: rankingItemId });
    });
  });
}); 