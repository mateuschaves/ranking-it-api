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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtUserPayload } from '../shared/interfaces/jwt-user-payload.entity';
import { AclEnum } from '../shared/entities/File';
import { UploadFileRequest } from './interfaces/upload-file-request.interface';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/user/decorators/get-current-user.decorator';

@ApiTags('Attachments')
@ApiBearerAuth('JWT-auth')
@Controller('attachments')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('attachment'))
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Multipart form with the file and visibility flag',
    schema: {
      type: 'object',
      properties: {
        attachment: {
          type: 'string',
          format: 'binary',
          description: 'The file to upload',
        },
        public: {
          type: 'string',
          enum: ['true', 'false'],
          default: 'false',
          description: 'If true, file becomes public (default false)',
        },
      },
      required: ['attachment'],
      example: {
        public: 'false',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid file or parameters',
  })
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
  @ApiOperation({ summary: 'Get a private file by key' })
  @ApiParam({ name: 'key', description: 'File key/identifier' })
  @ApiResponse({
    status: 200,
    description: 'File retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  async getPrivateFile(@Param('key') key: string) {
    return await this.filesService.getFile(key);
  }
}
