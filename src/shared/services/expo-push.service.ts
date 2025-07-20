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
} 