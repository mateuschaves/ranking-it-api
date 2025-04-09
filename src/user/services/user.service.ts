import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
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

      Logger.log('generating token', 'UserService.createAccount');
      const accessToken = await this.jwtService.signAsync(
        { id: user.id },
        {
          expiresIn: jwtConstants.expiresIn,
          secret: jwtConstants.secret,
        },
      );

      return { accessToken, expiresIn: jwtConstants.expiresIn };
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

      Logger.log('generating token', 'UserService.login');
      const accessToken = await this.jwtService.signAsync(
        { id: user.id },
        {
          expiresIn: jwtConstants.expiresIn,
          secret: jwtConstants.secret,
        },
      );

      return { accessToken, expiresIn: jwtConstants.expiresIn };
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
}
