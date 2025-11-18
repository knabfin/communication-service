import { DateTime } from 'luxon';
import { KnabError } from '../utils/knabError';
export * as Misc from './misc';

/**
 * Throws a KnabError if the condition is falsy
 */
export function invariant(
  condition: any,
  message: string | (() => string),
): asserts condition {
  if (!condition) {
    const msg = typeof message === 'function' ? message() : message;
    throw new KnabError(msg, 'INVARIANT_ERROR');
  }
}

/**
 * Safely parses JSON (returns string if parsing fails)
 */
export const safeParseJson = (str: string) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(str);
  } catch {
    return str;
  }
};

/**
 * Parses JSON, throws KnabError if invalid
 */
export const errorHandledJSONParse = (str: string): object => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(str);
  } catch {
    throw new KnabError('Invalid JSON body', 'JSON_PARSE_ERROR');
  }
};

/**
 * Safely parse number
 */
export const safeParseNumber = (input: string) => {
  if (typeof input !== 'string') return null;
  if (input.trim() === '') return null;
  const parsed = Number(input);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
};

/**
 * Check if given date is today (in IST)
 */
export const isToday = (date: Date): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const today = DateTime.local().setZone('Asia/Kolkata');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const providedDate = DateTime.fromJSDate(date).setZone('Asia/Kolkata');

  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    providedDate.day === today.day &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    providedDate.month === today.month &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    providedDate.year === today.year
  );
};

/**
 * Rounds a number with support for .5 case
 */
export const customRound = (number: number, roundTo: number = 0) => {
  const frac = number - Math.floor(number);

  if (frac === 0.5) {
    const upFrac = frac + 0.1;
    number = Math.floor(number) + upFrac;
  }

  return Number(number.toFixed(roundTo));
};

/**
 * Capitalize all words in string
 */
export const capitalizeWords = (str: string | null) => {
  if (!str) return null;
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Calculate age from ISO date
 */
export const calculateAge = (dateOfBirth: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const dob = DateTime.fromISO(dateOfBirth);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const today = DateTime.now();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  let age = today.year - dob.year;
  if (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    today.month < dob.month ||
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (today.month === dob.month && today.day < dob.day)
  ) {
    age--;
  }

  return age;
};

/**
 * Convert number to INR format (INR 1,23,456.00)
 */
export const toIndianFormat = (amount: number) => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount).replace('₹', 'INR ');
};

/**
 * Simple fuzzy name equality check
 */
export const fuzzyNameCheck = (name1: string, name2: string) => {
  return name1 === name2;
};

/**
 * Append suffix to day number (1st, 2nd, 3rd, etc.)
 */
export const appendSuffixForDay = (day: number) => {
  const dayEndings: Record<number, string> = {
    1: 'ˢᵗ',
    2: 'ⁿᵈ',
    3: 'ʳᵈ',
    21: 'ˢᵗ',
    22: 'ⁿᵈ',
    23: 'ʳᵈ',
    31: 'ˢᵗ',
  };

  if (!dayEndings[day]) {
    return `${day}ᵗʰ`;
  } else {
    return `${day}${dayEndings[day]}`;
  }
};

/**
 * Split array into chunks
 */
export const chunkArray = <T>(arr: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};
