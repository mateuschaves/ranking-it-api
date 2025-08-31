import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { EncryptService } from './services/encrypt.service';
import { JwtService } from '@nestjs/jwt';
import { CdnService } from './services/cdn.service';
import { ExpoPushService } from './services/expo-push.service';

@Global()
@Module({
  providers: [PrismaService, EncryptService, JwtService, CdnService, ExpoPushService],
  exports: [PrismaService, EncryptService, CdnService, ExpoPushService],
})
export class SharedModule {}
