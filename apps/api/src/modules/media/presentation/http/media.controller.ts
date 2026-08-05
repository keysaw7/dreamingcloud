import { Body, Controller, Param, Post } from '@nestjs/common';
import { z } from 'zod';

import { CurrentUser } from '../../../identity/presentation/http/current-user.decorator';
import { ConfirmUploadUseCase } from '../../application/commands/confirm-upload.use-case';
import { RequestUploadUseCase } from '../../application/commands/request-upload.use-case';

const requestUploadSchema = z.object({
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024),
});

@Controller('media')
export class MediaController {
  public constructor(
    private readonly requestUpload: RequestUploadUseCase,
    private readonly confirmUpload: ConfirmUploadUseCase,
  ) {}

  @Post('uploads')
  public async createUpload(@CurrentUser() userId: string, @Body() body: unknown) {
    const input = requestUploadSchema.parse(body);
    const result = await this.requestUpload.execute({
      ownerId: userId,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
    });
    return { data: result };
  }

  @Post(':id/confirm')
  public async confirm(@CurrentUser() userId: string, @Param('id') mediaId: string) {
    const result = await this.confirmUpload.execute({
      mediaId,
      ownerId: userId,
    });
    return { data: result };
  }
}
