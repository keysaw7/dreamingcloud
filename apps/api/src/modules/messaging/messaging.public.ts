export interface MessagingPublicApi {
  createContributionConversation(input: {
    contributionId: string;
    participantIds: readonly string[];
  }): Promise<string>;
}

export const MESSAGING_PUBLIC_API = Symbol('MESSAGING_PUBLIC_API');
