import { Body, Controller, Post, Get, UseGuards, Patch, Req, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import SignUpDto from '../dto/SignUpDto';
import SignInDto from '../dto/SignInDto';
import { RefreshTokenDto } from '../dto/RefreshTokenDto';
import { JwtAuthGuard } from '../guards/JwtAuth.guard';
import { GetUser } from '../decorators/get-current-user.decorator';
import { RankingUserRepository } from '../../ranking/repositories/ranking-user.repository';
import { UserRepository } from '../repositories/user.repository';
import { UpdateAvatarDto } from '../dto/UpdateAvatarDto';
import { UpdatePushTokenDto } from '../dto/UpdatePushTokenDto';
import { UrlUtil } from '../../shared/utils/url.util';

@ApiTags('User Authentication')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private readonly rankingUserRepository: RankingUserRepository,
  ) {}

  @Post('/signup')
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({
    status: 201,
    description: 'User account created successfully',
    schema: {
      properties: {
        id: { type: 'string', example: 'user-123' },
        email: { type: 'string', example: 'john.doe@example.com' },
        name: { type: 'string', example: 'John Doe' },
        token: { type: 'string', example: 'jwt-token-here' },
      },
      example: {
        id: 'user-123',
        email: 'john.doe@example.com',
        name: 'John Doe',
        token: 'jwt-token-here',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
    schema: { example: { message: 'Email já cadastrado 🕵️‍♂️' } },
  })
  async signup(@Body() CreateAccountDto: SignUpDto) {
    return this.userService.createAccount(CreateAccountDto);
  }

  @Post('/signin')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @ApiOperation({ summary: 'Sign in with existing account' })
  @ApiBody({ type: SignInDto })
  @ApiResponse({
    status: 200,
    description: 'User signed in successfully',
    schema: {
      properties: {
        id: { type: 'string', example: 'user-123' },
        email: { type: 'string', example: 'john.doe@example.com' },
        name: { type: 'string', example: 'John Doe' },
        token: { type: 'string', example: 'jwt-token-here' },
      },
      example: {
        id: 'user-123',
        email: 'john.doe@example.com',
        name: 'John Doe',
        token: 'jwt-token-here',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid credentials',
    schema: { example: { message: 'Senha incorreta 🕵️‍♂️' } },
  })
  async signin(@Body() { email, password }) {
    return this.userService.login(email, password);
  }

  @Post('/refresh-token')
  @ApiOperation({ summary: 'Refresh access token using a refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    schema: {
      properties: {
        accessToken: { type: 'string', example: 'new-access-token' },
        refreshToken: { type: 'string', example: 'new-refresh-token' },
        expiresIn: { type: 'number', example: 3600 },
      },
      example: {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid refresh token',
    schema: { example: { message: 'Invalid refresh token' } },
  })
  async refreshToken(@Body() { refreshToken }: RefreshTokenDto) {
    return this.userService.refreshToken(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me/profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter perfil do usuário logado e contagem de convites pendentes' })
  @ApiResponse({
    status: 200,
    description: 'Perfil do usuário logado e contagem de convites pendentes',
    schema: {
      example: {
        id: 'user-123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatarId: 'file-123',
        avatarUrl: 'http://ranking-attachments.s3.us-east-1.amazonaws.com/avatar.jpg',
        createdAt: '2024-07-01T12:00:00.000Z',
        pendingInvitesCount: 2,
      },
      properties: {
        id: { type: 'string', description: 'ID do usuário' },
        name: { type: 'string', description: 'Nome do usuário' },
        email: { type: 'string', description: 'E-mail do usuário' },
        avatarId: { type: 'string', description: 'ID do avatar (opcional)' },
        avatarUrl: { type: 'string', description: 'URL do avatar (opcional)' },
        createdAt: { type: 'string', format: 'date-time', description: 'Data de criação' },
        pendingInvitesCount: { type: 'number', description: 'Quantidade de convites pendentes' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado. Token JWT ausente ou inválido.'
  })
  async getProfile(@GetUser() userId: string) {
    const user = await this.userRepository.findOne({ id: userId }, true) as any;
    if (!user) throw new Error('Usuário não encontrado');
    const invites = await this.rankingUserRepository.getRankingInvitesByEmail(user.email);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarId: user.avatarId,
      avatarUrl: user.avatar?.url ? UrlUtil.getFullUrl(user.avatar.url) : null,
      createdAt: user.createdAt,
      pendingInvitesCount: invites.length,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/me/avatar')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar avatar do usuário logado' })
  @ApiBody({ type: UpdateAvatarDto })
  @ApiResponse({
    status: 200,
    description: 'Avatar atualizado com sucesso',
    schema: { example: { message: 'Avatar atualizado com sucesso' } },
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida', schema: { example: { message: 'Usuário não encontrado' } } })
  @ApiResponse({ status: 401, description: 'Não autorizado. Token JWT ausente ou inválido.' })
  async updateAvatar(@GetUser() userId: string, @Body() body: UpdateAvatarDto) {
    return this.userService.updateAvatar(userId, body.avatarId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/push-token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar push token do usuário logado' })
  @ApiBody({ type: UpdatePushTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Push token atualizado com sucesso',
    schema: { 
      example: { 
        success: true, 
        message: 'Push token atualizado com sucesso' 
      },
      properties: {
        success: { type: 'boolean', description: 'Indica se a operação foi bem-sucedida' },
        message: { type: 'string', description: 'Mensagem de confirmação' }
      }
    },
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Requisição inválida', 
    schema: { example: { message: 'Usuário não encontrado' } } 
  })
  @ApiResponse({ status: 401, description: 'Não autorizado. Token JWT ausente ou inválido.' })
  async updatePushToken(@GetUser() userId: string, @Body() body: UpdatePushTokenDto) {
    return this.userService.updatePushToken(userId, body.pushToken);
  }

  @Get('/auth/google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Iniciar autenticação com Google OAuth' })
  @ApiResponse({ status: 302, description: 'Redirecionamento para Google OAuth' })
  async googleAuth(@Req() req: Request) {
    // Guard redirects to Google
  }

  @Get('/auth/google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Callback do Google OAuth' })
  @ApiResponse({ 
    status: 200, 
    description: 'Autenticação Google bem-sucedida',
    schema: {
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' }
          }
        },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' }
      }
    }
  })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.userService.validateOAuthUser(req.user, 'google');
    
    // Redirect to frontend with tokens
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${result.accessToken}&refresh=${result.refreshToken}`;
    res.redirect(redirectUrl);
  }

  @Post('/auth/google/mobile')
  @Throttle({ default: { limit: 5, ttl: 300 } }) // 5 tentativas por 5 minutos
  @ApiOperation({ summary: 'Autenticação Google para mobile (React Native)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idToken: { type: 'string', description: 'Google ID Token do React Native' },
        accessToken: { type: 'string', description: 'Google Access Token' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            photo: { type: 'string' }
          }
        }
      },
      required: ['idToken', 'user']
    },
    examples: {
      example1: {
        summary: 'Exemplo de request Google',
        value: {
          idToken: 'eyJhbGciOiJSUzI1NiIs...',
          accessToken: 'ya29.a0AfH6SMC...',
          user: {
            id: '123456789',
            email: 'user@gmail.com',
            name: 'João Silva',
            photo: 'https://lh3.googleusercontent.com/...'
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Autenticação Google mobile bem-sucedida',
    schema: {
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' }
          }
        },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido ou dados faltando',
    schema: { example: { message: 'Token Google inválido' } }
  })
  async googleAuthMobile(@Body() body: any) {
    return this.userService.validateMobileOAuthUser({
      idToken: body.idToken,
    }, 'google');
  }

  @Get('/auth/apple')
  @UseGuards(AuthGuard('apple'))
  @ApiOperation({ summary: 'Iniciar autenticação com Apple OAuth' })
  @ApiResponse({ status: 302, description: 'Redirecionamento para Apple OAuth' })
  async appleAuth(@Req() req: Request) {
    // Guard redirects to Apple
  }

  @Get('/auth/apple/callback')
  @UseGuards(AuthGuard('apple'))
  @ApiOperation({ summary: 'Callback do Apple OAuth' })
  @ApiResponse({ 
    status: 200, 
    description: 'Autenticação Apple bem-sucedida',
    schema: {
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' }
          }
        },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' }
      }
    }
  })
  async appleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.userService.validateOAuthUser(req.user, 'apple');
    
    // Redirect to frontend with tokens
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${result.accessToken}&refresh=${result.refreshToken}`;
    res.redirect(redirectUrl);
  }

  @Post('/auth/apple/mobile')
  @Throttle({ default: { limit: 5, ttl: 300 } }) // 5 tentativas por 5 minutos
  @ApiOperation({ summary: 'Autenticação Apple para mobile (React Native)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        identityToken: { type: 'string', description: 'Apple Identity Token' },
        authorizationCode: { type: 'string', description: 'Apple Authorization Code' },
        user: { type: 'string', description: 'Apple User ID' },
        email: { type: 'string', description: 'Email do usuário (se fornecido)' },
        fullName: {
          type: 'object',
          properties: {
            givenName: { type: 'string' },
            familyName: { type: 'string' }
          },
          description: 'Nome completo (apenas na primeira vez)'
        }
      },
      required: ['identityToken', 'user']
    },
    examples: {
      example1: {
        summary: 'Exemplo de request Apple',
        value: {
          identityToken: 'eyJraWQiOiI4NkQ4OEtmIiwiYWxnIjoiUlMyNTYifQ...',
          authorizationCode: 'c1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7',
          user: '001234.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
          email: 'user@privaterelay.appleid.com',
          fullName: {
            givenName: 'João',
            familyName: 'Silva'
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Autenticação Apple mobile bem-sucedida',
    schema: {
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' }
          }
        },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido ou dados faltando',
    schema: { example: { message: 'Token Apple inválido' } }
  })
  async appleAuthMobile(@Body() body: any) {
    return this.userService.validateMobileOAuthUser({
      identityToken: body.identityToken,
      user: body.user,
      fullName: body.fullName,
    }, 'apple');
  }
}
