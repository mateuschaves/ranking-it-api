import { Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class BucketService {
  AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_KEY_SECRET,
  });

  async uploadFile(file: Express.Multer.File) {
    if (!file) return;

    const timestamp = Date.now();
    const fileExtension = file?.originalname?.split('.').pop();
    const generatedFileName = `${timestamp}.${fileExtension}`;
    file.originalname = generatedFileName;

    return this.s3_upload(
      file?.buffer,
      this.AWS_S3_BUCKET as string,
      file?.originalname,
      file?.mimetype,
    );
  }

  async s3_upload(
    file: Buffer,
    bucket: string,
    name: string,
    mimetype: string,
  ) {
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
      ContentType: mimetype,
    };

    try {
      return await this.s3.upload(params).promise();
    } catch (e) {
      Logger.error(`Error uploading file to S3: ${e}`, BucketService.name);
    }
  }
}
