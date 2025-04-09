import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { EncryptService } from './services/encrypt.service';
import { JwtService } from '@nestjs/jwt';
import { CdnService } from './services/cdn.service';

@Global()
@Module({
  providers: [PrismaService, EncryptService, JwtService, CdnService],
  exports: [PrismaService, EncryptService, CdnService],
})
export class SharedModule {}
