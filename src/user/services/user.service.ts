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
import { OAuthValidatorService } from './oauth-validator.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly encryptService: EncryptService,
    private readonly oauthValidatorService: OAuthValidatorService,
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
      if (!user.password) {
        throw new BadRequestException('Usuário criado via OAuth, use login social');
      }
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

  async updatePushToken(userId: string, pushToken: string) {
    try {
      Logger.log(`Updating push token for user ${userId}`, 'UserService.updatePushToken');
      
      const user = await this.userRepository.findOne({ id: userId });
      if (!user) throw new BadRequestException('Usuário não encontrado');
      
      await this.userRepository.updateById(userId, { pushToken });
      
      Logger.log(`Push token updated successfully for user ${userId}`, 'UserService.updatePushToken');
      return { 
        success: true, 
        message: 'Push token atualizado com sucesso' 
      };
    } catch (error) {
      Logger.error(error, 'UserService.updatePushToken');
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao atualizar push token');
    }
  }

  async validateOAuthUser(profile: any, provider: 'google' | 'apple') {
    try {
      Logger.log(`Validating OAuth user from ${provider}`, 'UserService.validateOAuthUser');
      
      const email = profile.email;
      if (!email) {
        throw new BadRequestException('Email não encontrado no perfil OAuth');
      }

      // Check if user already exists
      let user = await this.userRepository.findOne({ email });
      
      if (user) {
        // Update provider ID if not set
        const updateData: any = {};
        if (provider === 'google' && !user.googleId) {
          updateData.googleId = profile.googleId;
        } else if (provider === 'apple' && !user.appleId) {
          updateData.appleId = profile.appleId;
        }
        
        if (Object.keys(updateData).length > 0) {
          await this.userRepository.updateById(user.id, updateData);
        }
      } else {
        // Create new user
        const userData: any = {
          email,
          name: profile.name,
          password: null, // OAuth users don't have passwords
        };

        if (provider === 'google') {
          userData.googleId = profile.googleId;
        } else if (provider === 'apple') {
          userData.appleId = profile.appleId;
        }

        user = await this.userRepository.create(userData);
        Logger.log(`Created new OAuth user: ${user.id}`, 'UserService.validateOAuthUser');
      }

      const tokens = await this.generateTokens(user.id);
      
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        ...tokens,
      };
    } catch (error) {
      Logger.error(error, 'UserService.validateOAuthUser');
      throw new InternalServerErrorException('Erro ao validar usuário OAuth');
    }
  }

  async validateMobileOAuthUser(requestData: any, provider: 'google' | 'apple') {
    try {
      Logger.log(`Validating mobile OAuth user from ${provider}`, 'UserService.validateMobileOAuthUser');
      
      let validatedProfile: any;
      
      if (provider === 'google') {
        // Validar token Google com Google APIs
        validatedProfile = await this.oauthValidatorService.validateGoogleToken(requestData.idToken);
      } else if (provider === 'apple') {
        // Validar token Apple
        validatedProfile = await this.oauthValidatorService.validateAppleToken(
          requestData.identityToken, 
          requestData.user
        );
        
        // Para Apple, o nome vem do request (só disponível na primeira vez)
        if (requestData.fullName) {
          validatedProfile.name = `${requestData.fullName.givenName || ''} ${requestData.fullName.familyName || ''}`.trim();
        } else {
          validatedProfile.name = 'Apple User';
        }
      }

      const email = validatedProfile.email;
      if (!email) {
        throw new BadRequestException('Email não encontrado no perfil OAuth');
      }

      // Check if user already exists
      let user = await this.userRepository.findOne({ email });
      
      if (user) {
        // Update provider ID if not set
        const updateData: any = {};
        if (provider === 'google' && !user.googleId) {
          updateData.googleId = validatedProfile.googleId;
        } else if (provider === 'apple' && !user.appleId) {
          updateData.appleId = validatedProfile.appleId;
        }
        
        if (Object.keys(updateData).length > 0) {
          await this.userRepository.updateById(user.id, updateData);
        }
      } else {
        // Create new user
        const userData: any = {
          email,
          name: validatedProfile.name,
          password: null, // OAuth users don't have passwords
        };

        if (provider === 'google') {
          userData.googleId = validatedProfile.googleId;
        } else if (provider === 'apple') {
          userData.appleId = validatedProfile.appleId;
        }

        user = await this.userRepository.create(userData);
        Logger.log(`Created new mobile OAuth user: ${user.id}`, 'UserService.validateMobileOAuthUser');
      }

      const tokens = await this.generateTokens(user.id);
      
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        ...tokens,
      };
    } catch (error) {
      Logger.error(error, 'UserService.validateMobileOAuthUser');
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao validar usuário OAuth mobile');
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
