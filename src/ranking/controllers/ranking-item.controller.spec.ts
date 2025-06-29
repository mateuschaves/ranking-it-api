import { Test, TestingModule } from '@nestjs/testing';
import { RankingItemController } from './ranking-item.controller';
import { RankingItemService } from '../services/ranking-item.service';
import { AuthGuard } from '@nestjs/passport';
import CreateRankingItemDto from '../dto/create-ranking-item.dto';

describe('RankingItemController', () => {
  let controller: RankingItemController;
  let service: RankingItemService;

  const mockRankingItemService = {
    createRankingItem: jest.fn(),
    getRankingItems: jest.fn(),
    deleteRankingItem: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RankingItemController],
      providers: [
        {
          provide: RankingItemService,
          useValue: mockRankingItemService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RankingItemController>(RankingItemController);
    service = module.get<RankingItemService>(RankingItemService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRankingItem', () => {
    it('should create a ranking item', async () => {
      const rankingId = 'ranking-id';
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

      mockRankingItemService.createRankingItem.mockResolvedValue(expectedResult);

      const result = await controller.createRankingItem(rankingId, createRankingItemDto, 'user-id');

      expect(service.createRankingItem).toHaveBeenCalledWith(createRankingItemDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getRankingItems', () => {
    it('should get ranking items', async () => {
      const rankingId = 'ranking-id';
      const userId = 'user-id';

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

      mockRankingItemService.getRankingItems.mockResolvedValue(expectedResult);

      const result = await controller.getRankingItems(rankingId, userId);

      expect(service.getRankingItems).toHaveBeenCalledWith(rankingId, userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deleteRankingItem', () => {
    it('should delete a ranking item', async () => {
      const rankingId = 'ranking-id';
      const rankingItemId = 'item-id';
      const userId = 'user-id';

      mockRankingItemService.deleteRankingItem.mockResolvedValue(undefined);

      await controller.deleteRankingItem(rankingId, rankingItemId, userId);

      expect(service.deleteRankingItem).toHaveBeenCalledWith(rankingItemId, userId);
    });
  });
}); 