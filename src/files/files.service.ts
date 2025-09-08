import { Injectable, Logger } from '@nestjs/common';
import { FileRepository } from '../shared/repositories/file.repository';
import CreateFileDto from '../shared/dtos/createFile.dto';
import { AclEnum } from '../shared/entities/File';
import { CdnService } from '../shared/services/cdn.service';
import { randomUUID } from 'crypto';
import ImageUtil from '../shared/utils/image.util';
import { Readable } from 'stream';
import * as Sharp from 'sharp';
const sharp: any = (Sharp as any);

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

      // Optimize only for image types; otherwise keep original buffer
      let outputBuffer = attachment.buffer;
      let outputMime = attachment.mimetype;
      let outputExt = extension;

      const isImage = /^image\/(jpeg|jpg|png|webp)$/i.test(attachment.mimetype);
      if (isImage) {
        try {
          // Convert to WebP with reasonable quality; you can tweak these values
          const webp = await sharp(attachment.buffer)
            .rotate() // auto-orient
            .webp({ quality: 80 })
            .toBuffer();

          outputBuffer = webp;
          outputMime = 'image/webp';
          outputExt = 'webp';
        } catch {
          // If sharp fails (e.g., invalid buffer in tests), fall back to original
          outputBuffer = attachment.buffer;
          outputMime = attachment.mimetype;
          outputExt = extension;
        }
      }

      const fileName = `${userId}:${randomUUID()}.${outputExt}`;

      createFileDto.name = fileName;
      createFileDto.buffer = Readable.from(outputBuffer);
      createFileDto.mimetype = outputMime;
      createFileDto.size = outputBuffer.length;

      Logger.log(`Uploading file in ${acl} mode: ${createFileDto.name}`);
      Logger.log(`File size: ${attachment.size}`);
      Logger.log(`File mimetype: ${attachment.mimetype}`);
      Logger.log(`File name: ${createFileDto.name}`);
      Logger.log(`Uploading file in ${acl} mode: ${createFileDto.name}`);
      await this.cndManagerService.uploadFile(
        this.bucket,
        createFileDto.name,
        createFileDto.buffer,
        createFileDto.size,
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
