import { Module } from '@nestjs/common';
import { RankingController } from './controllers/ranking.controller';
import { RankingService } from './services/ranking.service';
import {UserRepository} from "../user/repositories/user.repository";
import {RankingRepository} from "./repositories/ranking.repository";
import {RankingItemService} from "./services/ranking-item.service";
import {RankingValidationsService} from "./services/ranking-validations.service";
import {RankingUserService} from "./services/ranking-user.service";

@Module({
  controllers: [RankingController],
  providers: [RankingService, RankingItemService, RankingValidationsService, RankingUserService, UserRepository, RankingRepository],
})
export class RankingModule {}
