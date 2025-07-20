import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import SignUpDto from '../dto/SignUpDto';
import { EncryptService } from 'src/shared/services/encrypt.service';
import { jwtConstants } from 'src/shared/constants/jwt.constants';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly encryptService: EncryptService,
  ) {}

  async createAccount(createAccountRequest: SignUpDto) {
    try {
      Logger.log(
        `Creating account for ${createAccountRequest.email}`,
        'UserService.createAccount',
      );

      Logger.log(
        'checking if email already exists',
        'UserService.createAccount',
      );
      const emailExist = await this.userRepository.findOne({
        email: createAccountRequest.email,
      });
      if (emailExist) {
        throw new BadRequestException('Email já cadastrado 🕵️‍♂️');
      }

      const passwordEncrypted = await this.encryptService.hash(
        createAccountRequest.password,
      );

      Logger.log('creating user', 'UserService.createAccount');
      const user = await this.userRepository.create({
        email: createAccountRequest.email,
        password: passwordEncrypted,
        name: createAccountRequest.name,
        avatarId: createAccountRequest.avatarId,
      });

      Logger.log('generating tokens', 'UserService.createAccount');
      const { accessToken, refreshToken } = await this.generateTokens(user.id);

      // Save refresh token to database
      await this.userRepository.updateById(user.id, { refreshToken });

      return { 
        accessToken, 
        refreshToken,
        expiresIn: jwtConstants.expiresIn 
      };
    } catch (error) {
      Logger.error(error, 'UserService.createAccount');
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ops! Não foi possível criar a conta 🥲',
      );
    }
  }

  async login(email: string, password: string) {
    try {
      Logger.log(`Logging in ${email}`, 'UserService.login');
      Logger.log('checking if email exists', 'UserService.login');
      const user = await this.userRepository.findOne({ email });
      if (!user) {
        throw new BadRequestException('Email não cadastrado 🕵️‍♂️');
      }

      Logger.log('checking if password is correct', 'UserService.login');
      const passwordMatch = await this.encryptService.compare(
        user.password,
        password,
      );
      if (!passwordMatch) {
        throw new BadRequestException('Senha incorreta 🕵️‍♂️');
      }

      Logger.log('generating tokens', 'UserService.login');
      const { accessToken, refreshToken } = await this.generateTokens(user.id);

      // Save refresh token to database
      await this.userRepository.updateById(user.id, { refreshToken });

      return { 
        accessToken, 
        refreshToken,
        expiresIn: jwtConstants.expiresIn 
      };
    } catch (error) {
      Logger.error(error, 'UserService.login');
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ops! Não foi possível fazer login 🥲',
      );
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      Logger.log('Refreshing token', 'UserService.refreshToken');

      // Verify refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: jwtConstants.refreshTokenSecret,
      });

      // Find user by refresh token
      const user = await this.userRepository.findByRefreshToken(refreshToken);

      if (!user || user.id !== payload.id) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(user.id);

      // Update refresh token in database
      await this.userRepository.updateById(user.id, { refreshToken: newRefreshToken });

      return { 
        accessToken, 
        refreshToken: newRefreshToken,
        expiresIn: jwtConstants.expiresIn 
      };
    } catch (error) {
      Logger.error(error, 'UserService.refreshToken');
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    try {
      Logger.log(`Logging out user ${userId}`, 'UserService.logout');
      
      // Remove refresh token from database
      await this.userRepository.updateById(userId, { refreshToken: null });
      
      return { message: 'Logged out successfully' };
    } catch (error) {
      Logger.error(error, 'UserService.logout');
      throw new InternalServerErrorException('Error during logout');
    }
  }

  async updateAvatar(userId: string, avatarId: string) {
    try {
      const user = await this.userRepository.findOne({ id: userId });
      if (!user) throw new BadRequestException('Usuário não encontrado');
      await this.userRepository.updateById(userId, { avatar: { connect: { id: avatarId } } });
      return { message: 'Avatar atualizado com sucesso' };
    } catch (error) {
      Logger.error(error, 'UserService.updateAvatar');
      throw new InternalServerErrorException('Erro ao atualizar avatar');
    }
  }

  private async generateTokens(userId: string) {
    const accessToken = await this.jwtService.signAsync(
      { id: userId },
      {
        expiresIn: jwtConstants.expiresIn,
        secret: jwtConstants.secret,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { id: userId },
      {
        expiresIn: jwtConstants.refreshTokenExpiresIn,
        secret: jwtConstants.refreshTokenSecret,
      },
    );

    return { accessToken, refreshToken };
  }
}
