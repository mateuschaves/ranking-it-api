import { Test, TestingModule } from '@nestjs/testing';
import { RankingAbuseReportController } from './ranking-abuse-report.controller';
import { RankingAbuseReportService } from '../services/ranking-abuse-report.service';

describe('RankingAbuseReportController', () => {
  let controller: RankingAbuseReportController;
  let service: RankingAbuseReportService;

  const mockService = {
    reportRanking: jest.fn(),
    reportRankingItem: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RankingAbuseReportController],
      providers: [
        {
          provide: RankingAbuseReportService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<RankingAbuseReportController>(
      RankingAbuseReportController,
    );
    service = module.get<RankingAbuseReportService>(
      RankingAbuseReportService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service to report ranking', async () => {
    mockService.reportRanking.mockResolvedValue({ id: 'report-1' });

    const result = await controller.reportRanking(
      'ranking-id',
      'user-id',
      { description: 'Descrição' },
    );

    expect(service.reportRanking).toHaveBeenCalledWith(
      'ranking-id',
      'user-id',
      'Descrição',
    );
    expect(result).toEqual({ id: 'report-1' });
  });

  it('should call service to report ranking item', async () => {
    mockService.reportRankingItem.mockResolvedValue({ id: 'report-2' });

    const result = await controller.reportRankingItem(
      'ranking-id',
      'item-id',
      'user-id',
      { description: 'Descrição item' },
    );

    expect(service.reportRankingItem).toHaveBeenCalledWith(
      'ranking-id',
      'item-id',
      'user-id',
      'Descrição item',
    );
    expect(result).toEqual({ id: 'report-2' });
  });
});

