import { Test, TestingModule } from '@nestjs/testing';
import { ExpoPushService } from './expo-push.service';
import { Expo } from 'expo-server-sdk';

// Mock expo-server-sdk
jest.mock('expo-server-sdk', () => ({
  Expo: jest.fn().mockImplementation(() => ({
    isExpoPushToken: jest.fn(),
    sendPushNotificationsAsync: jest.fn(),
  })),
}));

describe('ExpoPushService', () => {
  let service: ExpoPushService;
  let mockExpo: jest.Mocked<Expo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpoPushService],
    }).compile();

    service = module.get<ExpoPushService>(ExpoPushService);
    mockExpo = service['expo'] as jest.Mocked<Expo>;
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

      mockExpo.isExpoPushToken.mockReturnValue(true);
      mockExpo.sendPushNotificationsAsync.mockResolvedValue([{ status: 'ok' }] as any);

      await service.sendPushNotification(expoPushToken, title, body);

      expect(mockExpo.isExpoPushToken).toHaveBeenCalledWith(expoPushToken);
      expect(mockExpo.sendPushNotificationsAsync).toHaveBeenCalledWith([
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

      mockExpo.isExpoPushToken.mockReturnValue(false);

      await service.sendPushNotification(expoPushToken, title, body);

      expect(mockExpo.isExpoPushToken).toHaveBeenCalledWith(expoPushToken);
      expect(mockExpo.sendPushNotificationsAsync).not.toHaveBeenCalled();
    });

    it('should handle send notification errors', async () => {
      const expoPushToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
      const title = 'Test Title';
      const body = 'Test Body';
      const error = new Error('Push notification failed');

      mockExpo.isExpoPushToken.mockReturnValue(true);
      mockExpo.sendPushNotificationsAsync.mockRejectedValue(error);

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

      mockExpo.isExpoPushToken.mockReturnValue(true);
      mockExpo.sendPushNotificationsAsync.mockResolvedValue([
        { status: 'ok' },
        { status: 'ok' },
      ] as any);

      await service.sendBulkPushNotifications(expoPushTokens, title, body);

      expect(mockExpo.sendPushNotificationsAsync).toHaveBeenCalledWith([
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

      mockExpo.isExpoPushToken
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      mockExpo.sendPushNotificationsAsync.mockResolvedValue([
        { status: 'ok' },
        { status: 'ok' },
      ] as any);

      await service.sendBulkPushNotifications(expoPushTokens, title, body);

      expect(mockExpo.sendPushNotificationsAsync).toHaveBeenCalledWith([
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

      expect(mockExpo.sendPushNotificationsAsync).not.toHaveBeenCalled();
    });

    it('should handle send bulk notification errors', async () => {
      const expoPushTokens = ['ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]'];
      const title = 'Test Title';
      const body = 'Test Body';
      const error = new Error('Bulk push notification failed');

      mockExpo.isExpoPushToken.mockReturnValue(true);
      mockExpo.sendPushNotificationsAsync.mockRejectedValue(error);

      // Should not throw error, just log it
      await expect(service.sendBulkPushNotifications(expoPushTokens, title, body)).resolves.toBeUndefined();
    });
  });
});
