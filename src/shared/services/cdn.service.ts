import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

enum AclEnum {
  PUBLIC = 'public-read',
  PRIVATE = 'private',
}

@Injectable()
export class CdnService {
  private readonly bucket = 'ranking-attachments';
  private readonly region = process.env.AWS_S3_REGION;

  private readonly s3Client = new S3Client({
    region: this.region,
  });

  async uploadFile(bucket: string, key: string, body: Readable, size: number) {
    if (!bucket) {
      throw new Error('Bucket is required');
    }
    if (!key) {
      throw new Error('Key is required');
    }
    if (!body) {
      throw new Error('Body is required');
    }

    return this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentLength: size,
      }),
    );
  }

  async getSingedUrl(bucket: string, key: string, expires: number) {
    if (!bucket) {
      throw new Error('Bucket is required');
    }
    if (!key) {
      throw new Error('Key is required');
    }
    if (!expires) {
      throw new Error('Expires is required');
    }
    return this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}
