import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { SharedModule } from './shared/shared.module';
import { RankingModule } from './ranking/ranking.module';
import { FilesModule } from './files/files.module';
import { AwsSdkModule } from 'nest-aws-sdk';
import { S3 } from 'aws-sdk';

@Module({
  imports: [
    UserModule,
    SharedModule,
    RankingModule,
    FilesModule,
    AwsSdkModule.forRoot({
      defaultServiceOptions: {
        endpoint: process.env.AWS_S3_ENDPOINT,
        region: process.env.AWS_S3_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
        },
      },
      services: [S3],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
