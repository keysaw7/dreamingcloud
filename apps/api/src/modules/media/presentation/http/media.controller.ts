import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { z } from 'zod';

import { Public } from '../../../../platform/security/authorization';
import { CurrentUser } from '../../../identity/presentation/http/current-user.decorator';
import { ConfirmUploadUseCase } from '../../application/commands/confirm-upload.use-case';
import { RequestUploadUseCase } from '../../application/commands/request-upload.use-case';
import { GetMediaQuery } from '../../application/queries/get-media.query';

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
    private readonly getMedia: GetMediaQuery,
  ) {}

  @Public()
  @Get(':id')
  public async getById(@Param('id') mediaId: string) {
    try {
      const media = await this.getMedia.execute(mediaId);
      if (!media) {
        throw new NotFoundException('Média introuvable.');
      }
      return { data: media };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Média introuvable.');
    }
  }

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
