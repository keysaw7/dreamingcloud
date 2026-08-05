export const OBJECT_STORAGE = Symbol('OBJECT_STORAGE');

export interface PresignedUpload {
  readonly uploadUrl: string;
  readonly storageKey: string;
}

export interface ObjectStorage {
  createPresignedUpload(input: {
    readonly storageKey: string;
    readonly mimeType: string;
    readonly sizeBytes: number;
    readonly expiresInSeconds?: number;
  }): Promise<PresignedUpload>;
  createPresignedDownload(input: {
    readonly storageKey: string;
    readonly expiresInSeconds?: number;
  }): Promise<string>;
  objectExists(storageKey: string): Promise<boolean>;
  getObjectBuffer(storageKey: string): Promise<Buffer>;
  putObject(input: {
    readonly storageKey: string;
    readonly body: Buffer;
    readonly mimeType: string;
  }): Promise<void>;
  getPublicUrl(storageKey: string): string;
}
