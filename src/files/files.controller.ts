import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtUserPayload } from '../shared/interfaces/jwt-user-payload.entity';
import { AclEnum } from '../shared/entities/File';
import { UploadFileRequest } from './interfaces/upload-file-request.interface';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/user/decorators/get-current-user.decorator';

@Controller('attachments')
@ApiTags('Attachments')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('attachment'))
  @UseGuards(AuthGuard('jwt'))
  async uploadFile(
    @UploadedFile() attachment: Express.Multer.File,
    @GetUser() userId: string,
    @Body() body: UploadFileRequest,
  ) {
    const acl = body.public === 'true' ? AclEnum.PUBLIC : AclEnum.PRIVATE;

    return await this.filesService.uploadFile(attachment, userId, acl);
  }

  @Get(':key')
  @HttpCode(200)
  async getPrivateFile(@Param('key') key: string) {
    return await this.filesService.getFile(key);
  }
}
