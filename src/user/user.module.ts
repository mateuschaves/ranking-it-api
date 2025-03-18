import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import {UserRepository} from "./repositories/user.repository";
import {JwtService} from "@nestjs/jwt";

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, JwtService],
})
export class UserModule {}
