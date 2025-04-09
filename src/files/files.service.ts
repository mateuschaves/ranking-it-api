import { Injectable, Logger } from '@nestjs/common';
import { FileRepository } from '../shared/repositories/file.repository';
import CreateFileDto from '../shared/dtos/createFile.dto';
import { AclEnum } from '../shared/entities/File';
import { CdnService } from '../shared/services/cdn.service';
import { randomUUID } from 'crypto';
import ImageUtil from '../shared/utils/image.util';
import { Readable } from 'stream';

@Injectable()
export class FilesService {
  private bucket = 'ranking-attachments';

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly cndManagerService: CdnService,
  ) {}

  async uploadFile(
    attachment: Express.Multer.File,
    userId: string,
    acl: AclEnum = AclEnum.PUBLIC,
  ) {
    try {
      const createFileDto = new CreateFileDto();

      const extension = ImageUtil.getExtension(attachment.mimetype);

      const fileName = `${userId}:${randomUUID()}.${extension}`;

      createFileDto.name = fileName;
      createFileDto.buffer = Readable.from(attachment.buffer);
      createFileDto.mimetype = attachment.mimetype;
      createFileDto.size = attachment.size;

      Logger.log(`Uploading file in ${acl} mode: ${createFileDto.name}`);
      Logger.log(`File size: ${attachment.size}`);
      Logger.log(`File mimetype: ${attachment.mimetype}`);
      Logger.log(`File name: ${createFileDto.name}`);
      Logger.log(`Uploading file in ${acl} mode: ${createFileDto.name}`);
      await this.cndManagerService.uploadFile(
        this.bucket,
        createFileDto.name,
        createFileDto.buffer,
        attachment.size,
      );

      createFileDto.url = fileName;
      createFileDto.path = fileName;

      return await this.fileRepository.createFile(createFileDto);
    } catch (error) {
      console.log(error);
      Logger.error(`Error uploading file: ${error.message}`);
      throw new Error(`Error uploading file: ${error.message}`);
    }
  }

  async getFile(key: string) {
    const signedUrl = await this.cndManagerService.getSingedUrl(
      this.bucket,
      key,
      Number(process.env.PRIVATE_URL_EXPIRATION as unknown as number),
    );

    return {
      signedUrl,
    };
  }

  async getFileFromDb(id: string) {
    return this.fileRepository.getFile(id);
  }
}
