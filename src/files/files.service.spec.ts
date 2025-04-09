import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CdnService } from '../shared/services/cdn.service';
import { FileRepository } from '../shared/repositories/file.repository';
import { JwtUserPayload } from '../shared/interfaces/jwt-user-payload.entity';

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

  it('should list files', async () => {
    const mockResolvedValue = [
      {
        Key: '800bb27e-ce90-4c93-847f-f8b990173cc9:010c8c85-5584-43e7-a2f6-a0d45ffbbe33.png',
        LastModified: new Date(),
        ETag: '"6b6b179d9b08e61da99c653a0e1f785e"',
        ChecksumAlgorithm: [],
        Size: 653656,
        StorageClass: 'STANDARD',
      },
    ];

    cdnService.listBucketContents.mockResolvedValueOnce(mockResolvedValue);
    const result = await service.listFiles();
    expect(result).toEqual(mockResolvedValue);
  });

  it('should upload file', async () => {
    const mockAttachment: Express.Multer.File = {
      fieldname: 'attachment',
      originalname: '010c8c85-5584-43e7-a2f6-a0d45ffbbe33.png',
      encoding: '7bit',
      mimetype: 'image/png',
      buffer: Buffer.from(''),
      size: 653656,
      stream: null,
      destination: null,
      filename: '010c8c85-5584-43e7-a2f6-a0d45ffbbe33.png',
      path: null,
    };

    const mockUser: JwtUserPayload = {
      sub: '800bb27e-ce90-4c93-847f-f8b990173cc9',
      email: 'mateus@gmail.com',
      name: 'Mateus',
      iat: 1627584778,
      exp: 1627588378,
    };

    const mockCreateFile = {
      id: '044781f8-14f4-42b5-9ca5-9469c83143d7',
      name: `${mockUser.sub}:1f6e6213-905e-4406-8b61-92ce8b3d2473.png`,
      url: 'https://hash4carbon.nyc3.digitaloceanspaces.com/800bb27e-ce90-4c93-847f-f8b990173cc9%3A1f6e6213-905e-4406-8b61-92ce8b3d2473.png',
      path: '800bb27e-ce90-4c93-847f-f8b990173cc9:1f6e6213-905e-4406-8b61-92ce8b3d2473.png',
      mimetype: 'image/png',
      size: 653656,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const mockUploadedFile = {
      Location:
        'https://hash4carbon.nyc3.digitaloceanspaces.com/800bb27e-ce90-4c93-847f-f8b990173cc9:010c8c85-5584-43e7-a2f6-a0d45ffbbe33.png',
      Key: '800bb27e-ce90-4c93-847f-f8b990173cc9:010c8c85-5584-43e7-a2f6-a0d45ffbbe33.png',
      Bucket: 'hash4carbon',
      ETag: '"6b6b179d9b08e61da99c653a0e1f785e"',
    };

    cdnService.uploadFile.mockResolvedValueOnce(mockUploadedFile);
    fileRepository.createFile.mockResolvedValueOnce(mockCreateFile);
    const result = await service.uploadFile(mockAttachment, mockUser);
    expect(result).toEqual(mockCreateFile);
    expect(result.path).toEqual(
      `${mockUser.sub}:1f6e6213-905e-4406-8b61-92ce8b3d2473.png`,
    );
  });
});
