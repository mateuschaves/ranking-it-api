import { Module } from '@nestjs/common';
import { RankingController } from './controllers/ranking.controller';
import { RankingService } from './services/ranking.service';
import { UserRepository } from '../user/repositories/user.repository';
import { RankingRepository } from './repositories/ranking.repository';
import { RankingItemService } from './services/ranking-item.service';
import { RankingValidationsService } from './services/ranking-validations.service';
import { RankingUserService } from './services/ranking-user.service';
import { RankingItemRepository } from './repositories/ranking-item.repository';
import { RankingUserRepository } from './repositories/ranking-user.repository';
import { RankingScoreRepository } from './repositories/ranking-score.repository';
import { RankingScoreService } from './services/ranking-score.service';
import { RankingItemController } from './controllers/ranking-item.controller';
import { RankingScoreController } from './controllers/ranking-score.controller';
import { BucketService } from 'src/shared/services/bucket.service';

@Module({
  controllers: [
    RankingController,
    RankingItemController,
    RankingScoreController,
  ],
  providers: [
    RankingService,
    RankingItemService,
    RankingValidationsService,
    RankingUserService,
    RankingScoreService,
    UserRepository,
    RankingRepository,
    RankingItemRepository,
    RankingUserRepository,
    RankingScoreRepository,
    BucketService,
  ],
})
export class RankingModule {}
