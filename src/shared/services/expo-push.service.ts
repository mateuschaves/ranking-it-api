import { Injectable, Logger } from '@nestjs/common';
import { Expo } from 'expo-server-sdk';

@Injectable()
export class ExpoPushService {
  private expo = new Expo();

  async sendPushNotification(expoPushToken: string, title: string, body: string) {
    if (!Expo.isExpoPushToken(expoPushToken)) {
      Logger.error(`Invalid Expo push token: ${expoPushToken}`);
      return;
    }
    const messages = [{
      to: expoPushToken,
      sound: 'default',
      title,
      body,
    }];
    try {
      await this.expo.sendPushNotificationsAsync(messages);
      Logger.log(`Push notification sent to ${expoPushToken}`);
    } catch (error) {
      Logger.error(`Error sending push notification: ${error}`);
    }
  }

  async sendBulkPushNotifications(expoPushTokens: string[], title: string, body: string) {
    if (!Array.isArray(expoPushTokens) || expoPushTokens.length === 0) {
      return;
    }

    const validTokens = expoPushTokens.filter((token) => Expo.isExpoPushToken(token));

    if (validTokens.length === 0) {
      Logger.warn('No valid Expo push tokens provided for bulk notification');
      return;
    }

    const messages = validTokens.map((token) => ({
      to: token,
      sound: 'default' as const,
      title,
      body,
    }));

    try {
      const chunks = this.expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        await this.expo.sendPushNotificationsAsync(chunk);
      }
      Logger.log(`Bulk push notifications sent to ${validTokens.length} recipients`);
    } catch (error) {
      Logger.error(`Error sending bulk push notifications: ${error}`);
    }
  }
} 