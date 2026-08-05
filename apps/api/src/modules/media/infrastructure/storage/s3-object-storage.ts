import { Inject, Injectable } from '@nestjs/common';
import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import type { AppConfig } from '../../../../platform/config/app-config';
import { APP_CONFIG } from '../../../../platform/config/config.module';
import type { ObjectStorage, PresignedUpload } from '../../domain/ports/object-storage';

@Injectable()
export class S3ObjectStorage implements ObjectStorage {
  private readonly client: S3Client;

  public constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {
    this.client = new S3Client({
      endpoint: config.S3_ENDPOINT,
      region: config.S3_REGION,
      forcePathStyle: config.S3_FORCE_PATH_STYLE,
      credentials: {
        accessKeyId: config.S3_ACCESS_KEY_ID,
        secretAccessKey: config.S3_SECRET_ACCESS_KEY,
      },
    });
  }

  public async createPresignedUpload(input: {
    readonly storageKey: string;
    readonly mimeType: string;
    readonly sizeBytes: number;
    readonly expiresInSeconds?: number;
  }): Promise<PresignedUpload> {
    const command = new PutObjectCommand({
      Bucket: this.config.S3_BUCKET,
      Key: input.storageKey,
      ContentType: input.mimeType,
      ContentLength: input.sizeBytes,
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: input.expiresInSeconds ?? 900,
    });

    return {
      uploadUrl,
      storageKey: input.storageKey,
    };
  }

  public async createPresignedDownload(input: {
    readonly storageKey: string;
    readonly expiresInSeconds?: number;
  }): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.config.S3_BUCKET,
      Key: input.storageKey,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: input.expiresInSeconds ?? 900,
    });
  }

  public async objectExists(storageKey: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.config.S3_BUCKET,
          Key: storageKey,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  public async getObjectBuffer(storageKey: string): Promise<Buffer> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.config.S3_BUCKET,
        Key: storageKey,
      }),
    );

    const body = response.Body;
    if (!body) {
      throw new Error(`Objet S3 vide: ${storageKey}`);
    }

    const bytes = await body.transformToByteArray();
    return Buffer.from(bytes);
  }

  public async putObject(input: {
    readonly storageKey: string;
    readonly body: Buffer;
    readonly mimeType: string;
  }): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.S3_BUCKET,
        Key: input.storageKey,
        Body: input.body,
        ContentType: input.mimeType,
      }),
    );
  }

  public getPublicUrl(storageKey: string): string {
    // Kept for local debugging; prefer createPresignedDownload in app code.
    const endpoint = this.config.S3_ENDPOINT.replace(/\/$/, '');
    if (this.config.S3_FORCE_PATH_STYLE) {
      return `${endpoint}/${this.config.S3_BUCKET}/${storageKey}`;
    }

    const host = endpoint.replace(/^https?:\/\//, '');
    const protocol = endpoint.startsWith('http://') ? 'http' : 'https';
    return `${protocol}://${this.config.S3_BUCKET}.${host}/${storageKey}`;
  }
}
