import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RankingModule } from '../ranking/ranking.module';
import { UserContentBlockRepository } from './repositories/user-content-block.repository';
import { UserContentBlockService } from './services/user-content-block.service';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    JwtService,
    JwtStrategy,
    UserContentBlockRepository,
    UserContentBlockService,
  ],
  imports: [
      PassportModule,
      RankingModule,
  ]
})
export class UserModule {}
