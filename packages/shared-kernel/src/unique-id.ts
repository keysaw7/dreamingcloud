import { randomBytes } from 'node:crypto';

import { InvariantViolationError } from './errors.js';

const UUID_V7_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class UniqueId {
  private constructor(public readonly value: string) {}

  public static isValid(value: string): boolean {
    return UUID_V7_PATTERN.test(value);
  }

  public static create(value?: string): UniqueId {
    const id = value ?? UniqueId.generateV7();

    if (!UniqueId.isValid(id)) {
      throw new InvariantViolationError('UniqueId must be a valid UUIDv7.');
    }

    return new UniqueId(id.toLowerCase());
  }

  public equals(other: UniqueId): boolean {
    return this.value === other.value;
  }

  private static generateV7(): string {
    const bytes = new Uint8Array(randomBytes(16));

    let timestamp = Date.now();
    for (let index = 5; index >= 0; index -= 1) {
      bytes[index] = timestamp & 0xff;
      timestamp = Math.floor(timestamp / 256);
    }

    bytes[6] = (bytes[6]! & 0x0f) | 0x70;
    bytes[8] = (bytes[8]! & 0x3f) | 0x80;

    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
      16,
      20,
    )}-${hex.slice(20)}`;
  }
}
