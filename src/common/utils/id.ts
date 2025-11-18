/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { init } from '@paralleldrive/cuid2';

export const createBrandedId = (brand: string, length: number = 16) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const createId = init({ length });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return `${brand}_${createId()}`;
};

export const createCuidWithLength = (len: number) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const id = init({
    length: len,
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  return id();
};
