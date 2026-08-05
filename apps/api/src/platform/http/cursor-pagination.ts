import { BadRequestException } from '@nestjs/common';

export interface CursorPayload {
  readonly createdAt: string;
  readonly id: string;
  readonly score?: number;
}

export interface CursorPage<T> {
  readonly data: readonly T[];
  readonly meta: {
    readonly nextCursor: string | null;
  };
}

export function encodeCursor(cursor: CursorPayload): string {
  return Buffer.from(JSON.stringify(cursor)).toString('base64url');
}

export function decodeCursor(cursor: string): CursorPayload {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !('id' in parsed) ||
      !('createdAt' in parsed) ||
      typeof parsed.id !== 'string' ||
      typeof parsed.createdAt !== 'string'
    ) {
      throw new Error('Invalid cursor.');
    }

    return {
      id: parsed.id,
      createdAt: parsed.createdAt,
      ...('score' in parsed && typeof parsed.score === 'number' ? { score: parsed.score } : {}),
    };
  } catch {
    throw new BadRequestException('The pagination cursor is invalid.');
  }
}

export function createCursorPage<T>(
  items: readonly T[],
  limit: number,
  toCursor: (item: T) => CursorPayload,
): CursorPage<T> {
  const hasNextPage = items.length > limit;
  const data = hasNextPage ? items.slice(0, limit) : items;
  const lastItem = data.at(-1);

  return {
    data,
    meta: {
      nextCursor: hasNextPage && lastItem ? encodeCursor(toCursor(lastItem)) : null,
    },
  };
}
