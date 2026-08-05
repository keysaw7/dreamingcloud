export interface MediaPublicView {
  readonly id: string;
  readonly ownerId: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly status: string;
  readonly publicUrl: string | null;
}

export interface MediaPublicApi {
  getMedia(mediaId: string): Promise<MediaPublicView | null>;
}

export const MEDIA_PUBLIC_API = Symbol('MEDIA_PUBLIC_API');
