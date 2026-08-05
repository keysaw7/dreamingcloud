import { Module } from '@nestjs/common';

import { CreateConversationForContributionUseCase } from './application/commands/create-conversation-for-contribution.use-case';
import { SendMessageUseCase } from './application/commands/send-message.use-case';
import { ListConversationsQuery } from './application/queries/list-conversations.query';
import { ListMessagesQuery } from './application/queries/list-messages.query';
import { MESSAGING_PUBLIC_API } from './messaging.public';
import { MessagingController } from './presentation/http/messaging.controller';

@Module({
  controllers: [MessagingController],
  providers: [
    CreateConversationForContributionUseCase,
    SendMessageUseCase,
    ListConversationsQuery,
    ListMessagesQuery,
    {
      provide: MESSAGING_PUBLIC_API,
      useFactory: (createConversation: CreateConversationForContributionUseCase) => ({
        createContributionConversation: (input: {
          contributionId: string;
          participantIds: readonly string[];
        }) => createConversation.execute(input),
      }),
      inject: [CreateConversationForContributionUseCase],
    },
  ],
  exports: [MESSAGING_PUBLIC_API],
})
export class MessagingModule {}
