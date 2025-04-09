import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import CreateFileDto from '../dtos/createFile.dto';

@Injectable()
export class FileRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createFile(createFileDto: CreateFileDto) {
    const { name, url, path, mimetype, size } = createFileDto;
    return await this.prismaService.file.create({
      data: {
        name,
        url,
        path,
        mimetype,
        size,
      },
    });
  }

  async getFile(id: string) {
    if (!id) return null;
    return this.prismaService.file.findFirst({
      where: {
        id,
      },
    });
  }
}
