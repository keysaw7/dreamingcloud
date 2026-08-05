import type { UniqueId } from './unique-id.js';

export interface DomainEvent<TPayload extends object> {
  readonly eventId: UniqueId;
  readonly name: string;
  readonly occurredAt: Date;
  readonly actorId: UniqueId | null;
  readonly aggregateType: string;
  readonly aggregateId: UniqueId;
  readonly correlationId: UniqueId;
  readonly causationId: UniqueId | null;
  readonly payload: TPayload;
}

export abstract class AggregateRoot {
  private readonly domainEvents: DomainEvent<object>[] = [];

  protected addDomainEvent(event: DomainEvent<object>): void {
    this.domainEvents.push(event);
  }

  public pullDomainEvents(): readonly DomainEvent<object>[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }
}
