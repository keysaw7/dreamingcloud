import type { DomainEvent } from '@dreamingcloud/shared-kernel';

import type { DatabaseTransaction } from '../database/database.types';

export const EVENT_PUBLISHER = Symbol('EVENT_PUBLISHER');

export interface EventPublisher {
  publish(transaction: DatabaseTransaction, events: readonly DomainEvent<object>[]): Promise<void>;
}
