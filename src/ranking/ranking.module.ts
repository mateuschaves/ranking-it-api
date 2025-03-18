import { Module } from '@nestjs/common';
import { RankingController } from './controllers/ranking.controller';
import { RankingService } from './services/ranking.service';
import {UserRepository} from "../user/repositories/user.repository";
import {UserModule} from "../user/user.module";
import {RankingRepository} from "./repositories/ranking.repository";

@Module({
  controllers: [RankingController],
  providers: [RankingService, UserRepository, RankingRepository],
})
export class RankingModule {}
