import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class OAuthValidatorService {
  private readonly googleClient: OAuth2Client;

  constructor(private configService: ConfigService) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID')
    );
  }

  async validateGoogleToken(idToken: string) {
    try {
      Logger.log('Validating Google ID token', 'OAuthValidatorService.validateGoogleToken');
      
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      
      if (!payload) {
        throw new BadRequestException('Token Google inválido');
      }

      // Verificar se o token não expirou
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new BadRequestException('Token Google expirado');
      }

      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        avatarUrl: payload.picture,
        emailVerified: payload.email_verified,
      };
    } catch (error) {
      Logger.error('Google token validation failed', error);
      throw new BadRequestException('Token Google inválido');
    }
  }

  async validateAppleToken(identityToken: string, user: string) {
    try {
      Logger.log('Validating Apple identity token', 'OAuthValidatorService.validateAppleToken');
      
      // Decodificar o token sem verificar a assinatura (para extrair dados)
      const decoded = jwt.decode(identityToken) as any;
      
      if (!decoded) {
        throw new BadRequestException('Token Apple inválido');
      }

      // Verificar se o token não expirou
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < now) {
        throw new BadRequestException('Token Apple expirado');
      }

      // Verificar se o issuer é Apple
      if (decoded.iss !== 'https://appleid.apple.com') {
        throw new BadRequestException('Token Apple de fonte inválida');
      }

      // Verificar se o audience é o nosso client ID
      if (decoded.aud !== this.configService.get<string>('APPLE_CLIENT_ID')) {
        throw new BadRequestException('Token Apple para aplicativo incorreto');
      }

      // Verificar se o subject corresponde ao user ID
      if (decoded.sub !== user) {
        throw new BadRequestException('Token Apple com user ID incorreto');
      }

      return {
        appleId: decoded.sub,
        email: decoded.email,
        emailVerified: decoded.email_verified,
      };
    } catch (error) {
      Logger.error('Apple token validation failed', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Token Apple inválido');
    }
  }
}

