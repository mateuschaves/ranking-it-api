import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { SharedModule } from './shared/shared.module';
import { RankingModule } from './ranking/ranking.module';

@Module({
  imports: [UserModule, SharedModule, RankingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
