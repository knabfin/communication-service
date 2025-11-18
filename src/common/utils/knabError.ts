export type ErrorCode =
  | 'UNKNOWN_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'INVARIANT_ERROR'
  | 'ZOD_VALIDATION_ERROR'
  | 'DMI_API_ERROR'
  | 'FETCHER_NOT_OK_ERROR'
  | 'FETCHER_OTHER_ERROR'
  | 'FETCHER_TIMEOUT_ERROR'
  | 'VALIDATION_ERROR'
  | 'JSON_PARSE_ERROR'
  | 'FORBIDDEN'
  | 'BAD_GATEWAY'
  | 'PRECONDITION_FAILED'
  | 'NOT_PROCESSABLE_ENTITY'
  | 'UPSTREAM_ERROR'
  | 'STATE_TRANSITION_ERROR'
  | 'LEAD_ALREADY_EXISTS'
  | 'UPSTREAM_ERROR.MFCENTRAL.UNKNOWN_ERROR'
  | 'UPSTREAM_ERROR.MFCENTRAL.INVALID_OTP'
  | 'UPSTREAM_ERROR.MFCENTRAL.INVALID_REQUEST'
  | 'UPSTREAM_ERROR.MFCENTRAL.PENDING'
  | 'UPSTREAM_ERROR.MFCENTRAL.INVALID_COMBINATION'
  | 'UPSTREAM_ERROR.MFCENTRAL.VALIDATE_LIEN_FAILURE'
  | 'UPSTREAM_ERROR.FINVU.NOT_FOUND'
  | 'UPSTREAM_ERROR.FINVU.CONSENT_NOT_FOUND'
  | 'UPSTREAM_ERROR.FINVU.UNKNOWN_ERROR'
  | 'UPSTREAM_ERROR.CLERK.PHONE_EXISTS'
  | 'UPSTREAM_ERROR.CLERK.OTHER_ERROR'
  | 'UPSTREAM_ERROR.LEADSQUARED.OTHER_ERROR'
  | 'UPSTREAM_ERROR.DMI.CALLBACK_PENDING'
  | 'UPSTREAM_ERROR.CLERK.USER_NOT_FOUND'
  | 'UPSTREAM_ERROR.DECENTRO.INVALID_COMBINATION'
  | 'LOAN_STATE_ERROR.MANDATE_ALREADY_EXISTS'
  | 'ELIGIBILITY.EXPIRED'
  | 'ELIGIBILITY.MINIMUM_AMOUNT_NOT_MET'
  | 'LOAN_STATE_ERROR.ESIGN_ALREADY_DONE'
  | 'LOAN_STATE_ERROR.VERIFICATION_FAILED'
  | 'LOAN_STATE_ERROR.HABILE_NOT_CREATED'
  | 'LOAN_STATE_ERROR.PAN_BANK_MISMATCH'
  | 'LENDER_MISMATCH_ERROR.EXPECTED_DMI'
  | 'LENDER_MISMATCH_ERROR.EXPECTED_KNAB'
  | 'LOAN_STATE_ERROR.KYC_ALREADY_DONE'
  | 'INVALID.PAN'
  | 'UPSTREAM_ERROR.MFCENTRAL.DECRYPT_FAILED'
  | 'UPSTREAM_ERROR.MFCENTRAL.SUBMIT_LIEN_FAILURE'
  | 'UPSTREAM_ERROR.MFCENTRAL.GET_TRANSACTION_FAILED'
  | 'UPSTREAM_ERROR.MFCENTRAL.CHECK_STATUS_FAILED';

export class KnabError extends Error {
  code: ErrorCode;
  constructor(message: string, code?: ErrorCode) {
    super(message);
    this.message = message;
    this.code = code ?? 'UNKNOWN_ERROR';
    Object.setPrototypeOf(this, KnabError.prototype);
  }
}

export class KnabErrorWithData<TActionData = unknown> extends Error {
  code: ErrorCode;
  actionData?: TActionData;

  constructor(message: string, code?: ErrorCode, actionData?: TActionData) {
    super(message);
    this.code = code ?? 'UNKNOWN_ERROR';
    this.actionData = actionData;
    Object.setPrototypeOf(this, KnabErrorWithData.prototype);
  }
}

// helper functions (unchanged)
type ErrorWithMessage = { message: string };

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;
  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    return new Error(String(maybeError));
  }
}

export function getErrorMessage(error: unknown) {
  return toErrorWithMessage(error).message;
}

export function ensureError(value: unknown): Error {
  if (value instanceof Error) return value;
  let stringified = '[Unable to stringify the thrown value]';
  try {
    stringified = JSON.stringify(value);
  } catch {
    /* empty */
  }
  return new Error(
    `This value was thrown as is, not through an Error: ${stringified}`,
  );
}
