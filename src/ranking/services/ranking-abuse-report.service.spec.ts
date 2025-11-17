import { Test, TestingModule } from '@nestjs/testing';
import { RankingAbuseReportService } from './ranking-abuse-report.service';
import { RankingValidationsService } from './ranking-validations.service';
import { AbuseReportRepository } from '../repositories/abuse-report.repository';
import { BadRequestException } from '@nestjs/common';

describe('RankingAbuseReportService', () => {
  let service: RankingAbuseReportService;
  let rankingValidationsService: RankingValidationsService;
  let abuseReportRepository: AbuseReportRepository;

  const mockRankingValidationsService = {
    existRanking: jest.fn(),
    existRankingItem: jest.fn(),
  };

  const mockAbuseReportRepository = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RankingAbuseReportService,
        {
          provide: RankingValidationsService,
          useValue: mockRankingValidationsService,
        },
        {
          provide: AbuseReportRepository,
          useValue: mockAbuseReportRepository,
        },
      ],
    }).compile();

    service = module.get<RankingAbuseReportService>(RankingAbuseReportService);
    rankingValidationsService = module.get<RankingValidationsService>(
      RankingValidationsService,
    );
    abuseReportRepository =
      module.get<AbuseReportRepository>(AbuseReportRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('reportRanking', () => {
    it('should create ranking abuse report', async () => {
      mockRankingValidationsService.existRanking.mockResolvedValue({});
      mockAbuseReportRepository.create.mockResolvedValue({
        id: 'report-1',
      });

      const result = await service.reportRanking(
        'ranking-id',
        'user-id',
        'Descrição',
      );

      expect(rankingValidationsService.existRanking).toHaveBeenCalledWith(
        'ranking-id',
      );
      expect(abuseReportRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          rankingId: 'ranking-id',
          reportedById: 'user-id',
          description: 'Descrição',
        }),
      );
      expect(result).toEqual({ id: 'report-1' });
    });

    it('should throw when validation fails', async () => {
      mockRankingValidationsService.existRanking.mockRejectedValue(
        new BadRequestException('Ranking não encontrado'),
      );

      await expect(
        service.reportRanking('ranking-id', 'user-id', 'Descrição'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('reportRankingItem', () => {
    it('should create ranking item abuse report', async () => {
      mockRankingValidationsService.existRanking.mockResolvedValue({});
      mockRankingValidationsService.existRankingItem.mockResolvedValue({});
      mockAbuseReportRepository.create.mockResolvedValue({
        id: 'report-2',
      });

      const result = await service.reportRankingItem(
        'ranking-id',
        'item-id',
        'user-id',
        'Descrição item',
      );

      expect(rankingValidationsService.existRanking).toHaveBeenCalledWith(
        'ranking-id',
      );
      expect(rankingValidationsService.existRankingItem).toHaveBeenCalledWith(
        'item-id',
      );
      expect(abuseReportRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          rankingItemId: 'item-id',
          description: 'Descrição item',
        }),
      );
      expect(result).toEqual({ id: 'report-2' });
    });

    it('should throw when repository fails', async () => {
      mockRankingValidationsService.existRanking.mockResolvedValue({});
      mockRankingValidationsService.existRankingItem.mockResolvedValue({});
      mockAbuseReportRepository.create.mockRejectedValue(new Error('fail'));

      await expect(
        service.reportRankingItem(
          'ranking-id',
          'item-id',
          'user-id',
          'Descrição',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

