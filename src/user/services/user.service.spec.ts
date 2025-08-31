import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '../repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { EncryptService } from '../../shared/services/encrypt.service';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const mockUserRepository = {
      create: jest.fn(),
      findOne: jest.fn(),
      findByEmail: jest.fn(),
      updateById: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const mockEncryptService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: EncryptService,
          useValue: mockEncryptService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updatePushToken', () => {
    const userId = 'user-123';
    const pushToken = 'ExponentPushToken[test-token]';

    it('should update push token successfully', async () => {
      // Arrange
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        pushToken: null,
      };
      
      const updatedUser = {
        ...mockUser,
        pushToken,
      };
      
      userRepository.findOne.mockResolvedValue(mockUser as any);
      userRepository.updateById.mockResolvedValue(updatedUser as any);

      // Act
      const result = await service.updatePushToken(userId, pushToken);

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'Push token atualizado com sucesso',
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({ id: userId });
      expect(userRepository.updateById).toHaveBeenCalledWith(userId, { pushToken });
    });

    it('should throw BadRequestException when user is not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updatePushToken(userId, pushToken)).rejects.toThrow(
        new BadRequestException('Usuário não encontrado'),
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({ id: userId });
      expect(userRepository.updateById).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when database update fails', async () => {
      // Arrange
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        pushToken: null,
      };
      
      userRepository.findOne.mockResolvedValue(mockUser as any);
      userRepository.updateById.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(service.updatePushToken(userId, pushToken)).rejects.toThrow(
        new InternalServerErrorException('Erro ao atualizar push token'),
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({ id: userId });
      expect(userRepository.updateById).toHaveBeenCalledWith(userId, { pushToken });
    });

    it('should handle empty push token', async () => {
      // Arrange
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        pushToken: null,
      };
      
      const updatedUser = {
        ...mockUser,
        pushToken: '',
      };
      
      userRepository.findOne.mockResolvedValue(mockUser as any);
      userRepository.updateById.mockResolvedValue(updatedUser as any);

      // Act
      const result = await service.updatePushToken(userId, '');

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'Push token atualizado com sucesso',
      });
      expect(userRepository.updateById).toHaveBeenCalledWith(userId, { pushToken: '' });
    });

    it('should update existing push token', async () => {
      // Arrange
      const existingPushToken = 'ExponentPushToken[old-token]';
      const newPushToken = 'ExponentPushToken[new-token]';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        pushToken: existingPushToken,
      };
      
      const updatedUser = {
        ...mockUser,
        pushToken: newPushToken,
      };
      
      userRepository.findOne.mockResolvedValue(mockUser as any);
      userRepository.updateById.mockResolvedValue(updatedUser as any);

      // Act
      const result = await service.updatePushToken(userId, newPushToken);

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'Push token atualizado com sucesso',
      });
      expect(userRepository.updateById).toHaveBeenCalledWith(userId, { pushToken: newPushToken });
    });
  });
});
