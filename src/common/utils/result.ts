import { KnabError } from '../utils/knabError';

export type Success<T> = { success: true; value: T };
export type Failure<E extends KnabError> = { success: false; error: E };

export type Result<T, E extends KnabError = KnabError> =
  | Success<T>
  | Failure<E>;

/**
 * Type guard to check if Result is Success
 */
export const isResultSuccess = <T, E extends KnabError = KnabError>(
  result: Result<T, E>,
): result is Success<T> => {
  return result.success && result.value !== undefined;
};

/**
 * Type guard to check if Result is Failure
 */
export const isResultFailure = <T, E extends KnabError = KnabError>(
  result: Result<T, E>,
): result is Failure<E> => {
  return (
    !result.success &&
    result.error !== undefined &&
    result.error instanceof KnabError
  );
};
