import { Test, TestingModule } from '@nestjs/testing';
import { EncryptService } from './encrypt.service';
import * as bcrypt from 'bcryptjs';

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('EncryptService', () => {
  let service: EncryptService;
  let mockBcrypt: jest.Mocked<typeof bcrypt>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EncryptService],
    }).compile();

    service = module.get<EncryptService>(EncryptService);
    mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    it('should hash a password successfully', async () => {
      const password = 'testPassword123';
      const hashedPassword = 'hashedPassword123';

      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);

      const result = await service.hash(password);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 8);
      expect(result).toBe(hashedPassword);
    });

    it('should handle hash errors', async () => {
      const password = 'testPassword123';
      const error = new Error('Hash failed');

      mockBcrypt.hash.mockRejectedValue(error as never);

      await expect(service.hash(password)).rejects.toThrow('Hash failed');
    });
  });

  describe('compare', () => {
    it('should compare passwords successfully - match', async () => {
      const rawPassword = 'testPassword123';
      const hashedPassword = 'hashedPassword123';

      mockBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.compare(rawPassword, hashedPassword);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(rawPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it('should compare passwords successfully - no match', async () => {
      const rawPassword = 'testPassword123';
      const hashedPassword = 'hashedPassword123';

      mockBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.compare(rawPassword, hashedPassword);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(rawPassword, hashedPassword);
      expect(result).toBe(false);
    });

    it('should handle compare errors', async () => {
      const rawPassword = 'testPassword123';
      const hashedPassword = 'hashedPassword123';
      const error = new Error('Compare failed');

      mockBcrypt.compare.mockRejectedValue(error as never);

      await expect(service.compare(rawPassword, hashedPassword)).rejects.toThrow('Compare failed');
    });
  });
});
