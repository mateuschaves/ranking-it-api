import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import {UserRepository} from "./repositories/user.repository";
import {JwtModule, JwtService} from "@nestjs/jwt";
import {PassportModule} from "@nestjs/passport";
import {jwtConstants} from "../shared/constants/jwt.constants";
import {JwtStrategy} from "./strategies/jwt.strategy";
import {GoogleStrategy} from "./strategies/google.strategy";
import {AppleStrategy} from "./strategies/apple.strategy";
import {OAuthValidatorService} from "./services/oauth-validator.service";
import { RankingModule } from '../ranking/ranking.module';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, JwtService, JwtStrategy, GoogleStrategy, AppleStrategy, OAuthValidatorService],
  imports: [
      PassportModule,
      ConfigModule,
      RankingModule,
  ]
})
export class UserModule {}
