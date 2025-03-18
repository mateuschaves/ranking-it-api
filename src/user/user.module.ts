import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import {UserRepository} from "./repositories/user.repository";
import {JwtModule, JwtService} from "@nestjs/jwt";
import {PassportModule} from "@nestjs/passport";
import {jwtConstants} from "../shared/constants/jwt.constants";
import {JwtStrategy} from "./strategies/jwt.strategy";

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, JwtService, JwtStrategy],
  imports: [
      PassportModule,
  ]
})
export class UserModule {}
