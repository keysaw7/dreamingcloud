type Success<T> = {
  readonly ok: true;
  readonly value: T;
};

type Failure<E> = {
  readonly ok: false;
  readonly error: E;
};

export type Result<T, E> = Success<T> | Failure<E>;

export const Result = {
  ok<T>(value: T): Result<T, never> {
    return { ok: true, value };
  },

  fail<E>(error: E): Result<never, E> {
    return { ok: false, error };
  },

  isOk<T, E>(result: Result<T, E>): result is Success<T> {
    return result.ok;
  },

  isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
    return !result.ok;
  },
};
