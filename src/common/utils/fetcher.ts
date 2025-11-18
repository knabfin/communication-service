import { logger } from '../utils/powertools';
import { getErrorMessage, KnabError } from '../utils/knabError';
import { Result } from '../utils/result';
import { Dispatcher } from 'undici/types';

/**
 * Safely parses the response body to text first, then tries to convert it to JSON
 */
const safeParseRes = async (res: Response) => {
  const str = await res.text();
  if (str === '') return null;
  try {
    return JSON.parse(str) as unknown;
  } catch {
    return str; // return plain text if not JSON
  }
};

/**
 * Wrapper around fetch.
 * Uses Result pattern for return type.
 * Uses Node 18+ built-in fetch.
 * Handles JSON parsing, timeouts, and logging.
 */
export const fetcher = async (props: {
  url: RequestInfo;
  method?: RequestInit['method'];
  headers?: RequestInit['headers'];
  timeoutInMillis?: number;
  body?: RequestInit['body'];
  payload?: object;
  dispatcher?: Dispatcher;
}): Promise<Result<unknown>> => {
  const canonicalLogger = logger.createChild();

  const {
    url,
    method = 'GET',
    headers,
    payload,
    body,
    timeoutInMillis,
    dispatcher,
  } = props;

  try {
    canonicalLogger.appendKeys({ props });

    // prepare body
    let reqBody: RequestInit['body'] | undefined;
    if (payload && typeof payload === 'object') {
      reqBody = JSON.stringify(payload);
    }
    if (body) {
      reqBody = body;
    }

    // timeout handling
    const controller = new AbortController();
    const timeoutId = timeoutInMillis
      ? setTimeout(() => controller.abort(), timeoutInMillis)
      : null;

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json', // default, can be overridden
        ...headers,
      },
      ...(reqBody && { body: reqBody }),
      ...(dispatcher && { dispatcher }),
      ...(timeoutInMillis && { signal: AbortSignal.timeout(timeoutInMillis) }),
    });

    if (timeoutId) clearTimeout(timeoutId);

    console.log('raw res is::::', res);

    const responseBody = await safeParseRes(res);

    let response;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (res.ok) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      response = { success: true, value: responseBody } as const;
    } else {
      // Include HTTP status, status text, and body for debugging
      console.error(
        'RAW RESPONSE',
        res.status,
        res.statusText,
        typeof responseBody === 'string'
          ? responseBody
          : JSON.stringify(responseBody),
      );
      const errMessage = `HTTP ${res.status} ${res.statusText}: ${
        typeof responseBody === 'string'
          ? responseBody
          : JSON.stringify(responseBody)
      }`;
      const error = new KnabError(errMessage, 'FETCHER_NOT_OK_ERROR');
      response = { success: false, error } as const;
    }

    canonicalLogger.appendKeys({ response });
    // console.log({ response });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return response;
  } catch (err) {
    let errorCode;
    if (err instanceof Error && err.name === 'TimeoutError') {
      // can't find class TimeoutError in undici-types
      errorCode = 'FETCHER_TIMEOUT_ERROR' as const;
    }
    const error = new KnabError(
      getErrorMessage(err),
      errorCode ?? 'FETCHER_OTHER_ERROR',
    );
    const response = { success: false, error } as const;
    canonicalLogger.appendKeys({ response });
    // console.log({ response });
    return response;
  } finally {
    canonicalLogger.info('Fetcher Logs');
  }
};
