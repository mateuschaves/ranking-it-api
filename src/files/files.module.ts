import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { FileRepository } from '../shared/repositories/file.repository';

@Module({
  providers: [FilesService, FileRepository],
  controllers: [FilesController],
  exports: [FilesService, FileRepository],
})
export class FilesModule {}
