import { Test, TestingModule } from '@nestjs/testing';
import { ExpoPushService } from './expo-push.service';
import { Expo } from 'expo-server-sdk';

// Mock expo-server-sdk
jest.mock('expo-server-sdk', () => {
  const mockIsExpoPushToken = jest.fn();
  const mockSendPushNotificationsAsync = jest.fn();
  const mockChunkPushNotifications = jest.fn();

  return {
    Expo: Object.assign(
      jest.fn().mockImplementation(() => ({
        sendPushNotificationsAsync: mockSendPushNotificationsAsync,
        getPushNotificationReceiptsAsync: jest.fn(),
        chunkPushNotifications: mockChunkPushNotifications,
        chunkPushNotificationReceiptIds: jest.fn(),
      })),
      {
        isExpoPushToken: mockIsExpoPushToken,
      },
    ),
    mockIsExpoPushToken,
    mockSendPushNotificationsAsync,
    mockChunkPushNotifications,
  };
});

describe('ExpoPushService', () => {
  let service: ExpoPushService;
  let mockIsExpoPushToken: jest.Mock;
  let mockSendPushNotificationsAsync: jest.Mock;
  let mockChunkPushNotifications: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpoPushService],
    }).compile();

    service = module.get<ExpoPushService>(ExpoPushService);
    
    // Get the mocked functions from the module
    const expoModule = await import('expo-server-sdk');
    mockIsExpoPushToken = (expoModule as any).mockIsExpoPushToken;
    mockSendPushNotificationsAsync = (expoModule as any).mockSendPushNotificationsAsync;
    mockChunkPushNotifications = (expoModule as any).mockChunkPushNotifications;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendPushNotification', () => {
    it('should send push notification successfully', async () => {
      const expoPushToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
      const title = 'Test Title';
      const body = 'Test Body';

      mockIsExpoPushToken.mockReturnValue(true);
      mockSendPushNotificationsAsync.mockResolvedValue([{ status: 'ok' }] as any);

      await service.sendPushNotification(expoPushToken, title, body);

      expect(mockIsExpoPushToken).toHaveBeenCalledWith(expoPushToken);
      expect(mockSendPushNotificationsAsync).toHaveBeenCalledWith([
        {
          to: expoPushToken,
          sound: 'default',
          title,
          body,
        },
      ]);
    });

    it('should not send notification for invalid token', async () => {
      const expoPushToken = 'invalid-token';
      const title = 'Test Title';
      const body = 'Test Body';

      mockIsExpoPushToken.mockReturnValue(false);

      await service.sendPushNotification(expoPushToken, title, body);

      expect(mockIsExpoPushToken).toHaveBeenCalledWith(expoPushToken);
      expect(mockSendPushNotificationsAsync).not.toHaveBeenCalled();
    });

    it('should handle send notification errors', async () => {
      const expoPushToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
      const title = 'Test Title';
      const body = 'Test Body';
      const error = new Error('Push notification failed');

      mockIsExpoPushToken.mockReturnValue(true);
      mockSendPushNotificationsAsync.mockRejectedValue(error);

      // Should not throw error, just log it
      await expect(service.sendPushNotification(expoPushToken, title, body)).resolves.toBeUndefined();
    });
  });

  describe('sendBulkPushNotifications', () => {
    it('should send bulk push notifications successfully', async () => {
      const expoPushTokens = [
        'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
        'ExponentPushToken[yyyyyyyyyyyyyyyyyyyyyy]',
      ];
      const title = 'Test Title';
      const body = 'Test Body';

      mockIsExpoPushToken.mockReturnValue(true);
      mockChunkPushNotifications.mockReturnValue([
        [
          {
            to: expoPushTokens[0],
            sound: 'default',
            title,
            body,
          },
          {
            to: expoPushTokens[1],
            sound: 'default',
            title,
            body,
          },
        ],
      ]);
      mockSendPushNotificationsAsync.mockResolvedValue([
        { status: 'ok' },
        { status: 'ok' },
      ] as any);

      await service.sendBulkPushNotifications(expoPushTokens, title, body);

      expect(mockSendPushNotificationsAsync).toHaveBeenCalledWith([
        {
          to: expoPushTokens[0],
          sound: 'default',
          title,
          body,
        },
        {
          to: expoPushTokens[1],
          sound: 'default',
          title,
          body,
        },
      ]);
    });

    it('should filter out invalid tokens', async () => {
      const expoPushTokens = [
        'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
        'invalid-token',
        'ExponentPushToken[yyyyyyyyyyyyyyyyyyyyyy]',
      ];
      const title = 'Test Title';
      const body = 'Test Body';

      mockIsExpoPushToken
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      mockChunkPushNotifications.mockReturnValue([
        [
          {
            to: expoPushTokens[0],
            sound: 'default',
            title,
            body,
          },
          {
            to: expoPushTokens[2],
            sound: 'default',
            title,
            body,
          },
        ],
      ]);
      mockSendPushNotificationsAsync.mockResolvedValue([
        { status: 'ok' },
        { status: 'ok' },
      ] as any);

      await service.sendBulkPushNotifications(expoPushTokens, title, body);

      expect(mockSendPushNotificationsAsync).toHaveBeenCalledWith([
        {
          to: expoPushTokens[0],
          sound: 'default',
          title,
          body,
        },
        {
          to: expoPushTokens[2],
          sound: 'default',
          title,
          body,
        },
      ]);
    });

    it('should handle empty tokens array', async () => {
      const expoPushTokens: string[] = [];
      const title = 'Test Title';
      const body = 'Test Body';

      await service.sendBulkPushNotifications(expoPushTokens, title, body);

      expect(mockSendPushNotificationsAsync).not.toHaveBeenCalled();
    });

    it('should handle send bulk notification errors', async () => {
      const expoPushTokens = ['ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]'];
      const title = 'Test Title';
      const body = 'Test Body';
      const error = new Error('Bulk push notification failed');

      mockIsExpoPushToken.mockReturnValue(true);
      mockSendPushNotificationsAsync.mockRejectedValue(error);

      // Should not throw error, just log it
      await expect(service.sendBulkPushNotifications(expoPushTokens, title, body)).resolves.toBeUndefined();
    });
  });
});
