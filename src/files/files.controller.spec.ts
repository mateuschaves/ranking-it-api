import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { JwtService } from '@nestjs/jwt';
import { createMock } from '@golevelup/ts-jest';
import { FilesService } from './files.service';

describe('FilesController', () => {
  let controller: FilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: JwtService,
          useValue: createMock<JwtService>(),
        },
        {
          provide: FilesService,
          useValue: createMock<FilesService>(),
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
