import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export type UploadAssetType = 'avatar' | 'portfolio';

@Injectable()
export class S3UploadService {
  private readonly client: S3Client | null;
  private readonly bucket: string | null;

  constructor(private readonly config: ConfigService) {
    const bucket = this.config.get<string>('AWS_S3_BUCKET')?.trim();
    const region = this.config.get<string>('AWS_REGION')?.trim();
    const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID')?.trim();
    const secretAccessKey = this.config
      .get<string>('AWS_SECRET_ACCESS_KEY')
      ?.trim();
    if (!bucket || !region || !accessKeyId || !secretAccessKey) {
      this.client = null;
      this.bucket = null;
      return;
    }
    this.bucket = bucket;
    this.client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  private getS3OrThrow(): { client: S3Client; bucket: string } {
    if (!this.client || !this.bucket) {
      throw new ServiceUnavailableException(
        'Almacenamiento S3 no está configurado. Define AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY y AWS_S3_BUCKET en .env cuando lo integres.',
      );
    }
    return { client: this.client, bucket: this.bucket };
  }

  buildKey(userId: string, type: UploadAssetType, filename: string): string {
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 180);
    return `uploads/${type}/${userId}/${Date.now()}-${safe}`;
  }

  async generatePresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn = 300,
  ): Promise<string> {
    const { client, bucket } = this.getS3OrThrow();
    const cmd = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(client, cmd, { expiresIn });
  }

  async generatePresignedReadUrl(
    key: string,
    expiresIn = 3600,
  ): Promise<string> {
    const { client, bucket } = this.getS3OrThrow();
    const cmd = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    return getSignedUrl(client, cmd, { expiresIn });
  }

  async deleteFile(key: string): Promise<void> {
    const { client, bucket } = this.getS3OrThrow();
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  }
}
