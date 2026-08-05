export abstract class DomainError extends Error {
  public abstract readonly code: string;

  public constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvariantViolationError extends DomainError {
  public readonly code = 'invariant_violation';
}

export class NotFoundError extends DomainError {
  public readonly code = 'not_found';
}

export class ConflictError extends DomainError {
  public readonly code = 'conflict';
}
