import { Body, Controller, Post, Get, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import SignUpDto from '../dto/SignUpDto';
import SignInDto from '../dto/SignInDto';
import { RefreshTokenDto } from '../dto/RefreshTokenDto';
import { JwtAuthGuard } from '../guards/JwtAuth.guard';
import { GetUser } from '../decorators/get-current-user.decorator';
import { RankingUserRepository } from '../../ranking/repositories/ranking-user.repository';
import { UserRepository } from '../repositories/user.repository';
import { UpdateAvatarDto } from '../dto/UpdateAvatarDto';

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
  })
  async signup(@Body() CreateAccountDto: SignUpDto) {
    return this.userService.createAccount(CreateAccountDto);
  }

  @Post('/signin')
  @ApiOperation({ summary: 'Sign in with existing account' })
  @ApiBody({ type: SignInDto })
  @ApiResponse({
    status: 200,
    description: 'User signed in successfully',
    schema: {
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
        createdAt: '2024-07-01T12:00:00.000Z',
        pendingInvitesCount: 2,
      },
      properties: {
        id: { type: 'string', description: 'ID do usuário' },
        name: { type: 'string', description: 'Nome do usuário' },
        email: { type: 'string', description: 'E-mail do usuário' },
        avatarId: { type: 'string', description: 'ID do avatar (opcional)' },
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
    const user = await this.userRepository.findOne({ id: userId });
    if (!user) throw new Error('Usuário não encontrado');
    const invites = await this.rankingUserRepository.getRankingInvitesByEmail(user.email);
    // Considera todos como pendentes, pois não há campo status
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarId: user.avatarId,
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
  @ApiResponse({ status: 400, description: 'Requisição inválida' })
  @ApiResponse({ status: 401, description: 'Não autorizado. Token JWT ausente ou inválido.' })
  async updateAvatar(@GetUser() userId: string, @Body() body: UpdateAvatarDto) {
    return this.userService.updateAvatar(userId, body.avatarId);
  }
}
