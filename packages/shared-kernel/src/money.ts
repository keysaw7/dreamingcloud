import { InvariantViolationError } from './errors.js';

const CURRENCY_PATTERN = /^[A-Z]{3}$/;

export class Money {
  private constructor(
    public readonly amountMinor: bigint,
    public readonly currency: string,
  ) {}

  public static create(amountMinor: bigint, currency: string): Money {
    const normalizedCurrency = currency.trim().toUpperCase();

    if (amountMinor < 0n) {
      throw new InvariantViolationError('A monetary amount cannot be negative.');
    }

    if (!CURRENCY_PATTERN.test(normalizedCurrency)) {
      throw new InvariantViolationError('Currency must be an ISO 4217 code.');
    }

    return new Money(amountMinor, normalizedCurrency);
  }

  public add(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.create(this.amountMinor + other.amountMinor, this.currency);
  }

  public subtract(other: Money): Money {
    this.assertSameCurrency(other);

    if (other.amountMinor > this.amountMinor) {
      throw new InvariantViolationError('A monetary amount cannot become negative.');
    }

    return Money.create(this.amountMinor - other.amountMinor, this.currency);
  }

  public equals(other: Money): boolean {
    return this.amountMinor === other.amountMinor && this.currency === other.currency;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new InvariantViolationError('Monetary operations require matching currencies.');
    }
  }
}
