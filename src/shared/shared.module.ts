import {Global, Module} from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import {EncryptService} from "./services/encrypt.service";
import {JwtService} from "@nestjs/jwt";


@Global()
@Module({
  providers: [PrismaService, EncryptService, JwtService],
  exports: [PrismaService, EncryptService]
})
export class SharedModule {}
