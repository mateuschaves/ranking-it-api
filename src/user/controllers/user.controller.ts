import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import SignUpDto from '../dto/SignUpDto';
import SignInDto from '../dto/SignInDto';
import { RefreshTokenDto } from '../dto/RefreshTokenDto';

@ApiTags('User Authentication')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
}
