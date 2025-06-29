import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CdnService } from '../shared/services/cdn.service';
import { FileRepository } from '../shared/repositories/file.repository';
import { Readable } from 'stream';

describe('FilesService', () => {
  let service: FilesService;
  let cdnService: DeepMocked<CdnService>;
  let fileRepository: DeepMocked<FileRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        { provide: CdnService, useValue: createMock<CdnService>() },
        { provide: FileRepository, useValue: createMock<FileRepository>() },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    cdnService = module.get(CdnService);
    fileRepository = module.get(FileRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should upload file', async () => {
    const mockAttachment: Express.Multer.File = {
      fieldname: 'attachment',
      originalname: '010c8c85-5584-43e7-a2f6-a0d45ffbbe33.png',
      encoding: '7bit',
      mimetype: 'image/png',
      buffer: Buffer.from('test'),
      size: 653656,
      stream: Readable.from(Buffer.from('test')),
      destination: '/tmp',
      filename: '010c8c85-5584-43e7-a2f6-a0d45ffbbe33.png',
      path: '/tmp/010c8c85-5584-43e7-a2f6-a0d45ffbbe33.png',
    };

    const userId = '800bb27e-ce90-4c93-847f-f8b990173cc9';

    const mockCreateFile = {
      id: '044781f8-14f4-42b5-9ca5-9469c83143d7',
      name: `${userId}:1f6e6213-905e-4406-8b61-92ce8b3d2473.png`,
      url: 'https://hash4carbon.nyc3.digitaloceanspaces.com/800bb27e-ce90-4c93-847f-f8b990173cc9%3A1f6e6213-905e-4406-8b61-92ce8b3d2473.png',
      path: '800bb27e-ce90-4c93-847f-f8b990173cc9:1f6e6213-905e-4406-8b61-92ce8b3d2473.png',
      mimetype: 'image/png',
      size: 653656,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const mockUploadedFile = {
      $metadata: {
        httpStatusCode: 200,
        requestId: 'test-request-id',
        attempts: 1,
        totalRetryDelay: 0,
      },
      ETag: '"6b6b179d9b08e61da99c653a0e1f785e"',
    };

    cdnService.uploadFile.mockResolvedValueOnce(mockUploadedFile);
    fileRepository.createFile.mockResolvedValueOnce(mockCreateFile);
    
    const result = await service.uploadFile(mockAttachment, userId);
    
    expect(result).toEqual(mockCreateFile);
    expect(cdnService.uploadFile).toHaveBeenCalledWith(
      'ranking-attachments',
      expect.stringContaining(`${userId}:`),
      expect.any(Readable),
      653656,
    );
  });

  it('should get file', async () => {
    const key = 'test-file-key';
    const mockSignedUrl = {
      $metadata: {
        httpStatusCode: 200,
        requestId: 'test-request-id',
        attempts: 1,
        totalRetryDelay: 0,
      },
    };

    cdnService.getSingedUrl.mockResolvedValueOnce(mockSignedUrl);
    
    const result = await service.getFile(key);
    
    expect(result).toEqual({ signedUrl: mockSignedUrl });
    expect(cdnService.getSingedUrl).toHaveBeenCalledWith(
      'ranking-attachments',
      key,
      expect.any(Number),
    );
  });

  it('should get file from db', async () => {
    const fileId = 'test-file-id';
    const mockFile = {
      id: fileId,
      name: 'test-file.png',
      url: 'test-url',
      path: 'test-path',
      mimetype: 'image/png',
      size: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    fileRepository.getFile.mockResolvedValueOnce(mockFile);
    
    const result = await service.getFileFromDb(fileId);
    
    expect(result).toEqual(mockFile);
    expect(fileRepository.getFile).toHaveBeenCalledWith(fileId);
  });
});
