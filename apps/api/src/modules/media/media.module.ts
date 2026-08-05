import { Module } from '@nestjs/common';

import { MEDIA_UPLOADED_PROCESSOR } from '../../platform/jobs/domain-event.processor';
import { ConfirmUploadUseCase } from './application/commands/confirm-upload.use-case';
import { RequestUploadUseCase } from './application/commands/request-upload.use-case';
import { GetMediaQuery } from './application/queries/get-media.query';
import { MEDIA_REPOSITORY } from './domain/ports/media.repository';
import { OBJECT_STORAGE } from './domain/ports/object-storage';
import { DrizzleMediaRepository } from './infrastructure/persistence/drizzle-media.repository';
import { SharpMediaProcessor } from './infrastructure/processing/sharp-media-processor';
import { S3ObjectStorage } from './infrastructure/storage/s3-object-storage';
import { MEDIA_PUBLIC_API } from './media.public';
import { MediaController } from './presentation/http/media.controller';

@Module({
  controllers: [MediaController],
  providers: [
    RequestUploadUseCase,
    ConfirmUploadUseCase,
    GetMediaQuery,
    SharpMediaProcessor,
    { provide: MEDIA_REPOSITORY, useClass: DrizzleMediaRepository },
    { provide: OBJECT_STORAGE, useClass: S3ObjectStorage },
    { provide: MEDIA_UPLOADED_PROCESSOR, useExisting: SharpMediaProcessor },
    {
      provide: MEDIA_PUBLIC_API,
      useFactory: (query: GetMediaQuery) => ({
        getMedia: (mediaId: string) => query.execute(mediaId),
      }),
      inject: [GetMediaQuery],
    },
  ],
  exports: [MEDIA_PUBLIC_API, MEDIA_UPLOADED_PROCESSOR],
})
export class MediaModule {}
