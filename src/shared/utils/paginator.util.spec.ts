import { paginator, PaginateOptions, PaginatedResult } from './paginator.util';

describe('PaginatorUtil', () => {
  describe('paginator', () => {
    let mockModel: any;
    let paginateFunction: any;

    beforeEach(() => {
      mockModel = {
        count: jest.fn(),
        findMany: jest.fn(),
      };

      const defaultOptions: PaginateOptions = {
        page: 1,
        perPage: 10,
      };

      paginateFunction = paginator(defaultOptions);
    });

    it('should paginate data correctly', async () => {
      const mockData = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const mockTotal = 25;

      mockModel.count.mockResolvedValue(mockTotal);
      mockModel.findMany.mockResolvedValue(mockData);

      const result = await paginateFunction(mockModel, { where: {} }, { page: 2, perPage: 10 });

      expect(mockModel.count).toHaveBeenCalledWith({ where: {} });
      expect(mockModel.findMany).toHaveBeenCalledWith({
        where: {},
        take: 10,
        skip: 10,
      });

      expect(result).toEqual({
        data: mockData,
        meta: {
          total: mockTotal,
          lastPage: 3,
          currentPage: 2,
          perPage: 10,
          prev: 1,
          next: 3,
        },
      });
    });

    it('should use default options when not provided', async () => {
      const mockData = [{ id: 1 }];
      const mockTotal = 5;

      mockModel.count.mockResolvedValue(mockTotal);
      mockModel.findMany.mockResolvedValue(mockData);

      const result = await paginateFunction(mockModel);

      expect(mockModel.findMany).toHaveBeenCalledWith({
        where: undefined,
        take: 10,
        skip: 0,
      });

      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.perPage).toBe(10);
    });

    it('should handle empty results', async () => {
      const mockData: any[] = [];
      const mockTotal = 0;

      mockModel.count.mockResolvedValue(mockTotal);
      mockModel.findMany.mockResolvedValue(mockData);

      const result = await paginateFunction(mockModel, { where: {} });

      expect(result).toEqual({
        data: [],
        meta: {
          total: 0,
          lastPage: 0,
          currentPage: 1,
          perPage: 10,
          prev: null,
          next: null,
        },
      });
    });

    it('should handle last page correctly', async () => {
      const mockData = [{ id: 1 }];
      const mockTotal = 25;

      mockModel.count.mockResolvedValue(mockTotal);
      mockModel.findMany.mockResolvedValue(mockData);

      const result = await paginateFunction(mockModel, { where: {} }, { page: 3, perPage: 10 });

      expect(result.meta.next).toBe(null);
      expect(result.meta.prev).toBe(2);
    });
  });
});
