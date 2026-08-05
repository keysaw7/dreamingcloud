import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { z } from 'zod';

import { CurrentUser } from '../../../identity/presentation/http/current-user.decorator';
import { SendMessageUseCase } from '../../application/commands/send-message.use-case';
import { ListConversationsQuery } from '../../application/queries/list-conversations.query';
import { ListMessagesQuery } from '../../application/queries/list-messages.query';

@Controller()
export class MessagingController {
  public constructor(
    private readonly listConversations: ListConversationsQuery,
    private readonly listMessages: ListMessagesQuery,
    private readonly sendMessage: SendMessageUseCase,
  ) {}

  @Get('conversations')
  public async conversations(
    @CurrentUser() userId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit = '20',
  ) {
    const pageSize = Math.min(Number(limit) || 20, 50);
    const page = await this.listConversations.execute({
      userId,
      limit: pageSize,
      ...(cursor ? { cursor } : {}),
    });
    return { data: page.data, meta: page.meta };
  }

  @Get('conversations/:id/messages')
  public async messages(
    @CurrentUser() userId: string,
    @Param('id') conversationId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit = '50',
  ) {
    const pageSize = Math.min(Number(limit) || 50, 100);
    const page = await this.listMessages.execute({
      conversationId,
      userId,
      limit: pageSize,
      ...(cursor ? { cursor } : {}),
    });
    return { data: page.data, meta: page.meta };
  }

  @Post('conversations/:id/messages')
  public async postMessage(
    @CurrentUser() userId: string,
    @Param('id') conversationId: string,
    @Body() body: unknown,
  ) {
    const input = z
      .object({
        body: z.string().min(1).max(5000),
      })
      .parse(body);

    const result = await this.sendMessage.execute({
      conversationId,
      senderId: userId,
      body: input.body,
    });

    return { data: result };
  }
}
