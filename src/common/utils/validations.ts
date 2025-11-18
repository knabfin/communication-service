/**
 *
 * This is for validating any Zod Schema, while throwing a Knab Error on failure.
 * @throws {KnabError} with errorcode "ZOD_VALIDATION_ERROR" if zod validation of response body fails
 * @throws any other error as is
 * @param schema The Zod schema to validate against
 * @param input The input to validate
 */

import { KnabError } from '../utils/knabError';
import { safeParseJson } from '../utils/misc';
import z, { ZodError, ZodTypeAny } from 'zod';

export const zodParseWithKnabError = <T extends ZodTypeAny>({
  schema,
  input,
}: {
  schema: T;
  input: unknown;
}): z.infer<T> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const validatedInput = schema.parse(input);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return validatedInput;
  } catch (error) {
    if (error instanceof ZodError) {
      // TODO: should we parse the zod error and then send?
      // const validationError = fromZodError(error);
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const err = new KnabError(error.toString(), 'ZOD_VALIDATION_ERROR');
      throw err;
    }
    throw error;
  }
};

export const StringToNumberSchema = z.coerce.number();

//Added a zod refine to this schema to check if the BE1 response is not status 200, if it isn't it sends one of these reponses
//  message: 'Data Not Found'
// 'message': 'Invalid PAN/PEKRN, Mobile/Email combination'
//  message: 'Error occured in insert_mfcentral_requestLog' //Sent when empty PAN or Mobile Number
// 'message': 'Entered OTP appears to be incorrect. Please try again.'
// 'message': 'Time limit exceeded for the given OTP. Kindly resubmit the request to receive fresh OTP.'

const BEIWrapperResponseSchema = z
  .object({
    status: z.number(),
    data: z.any().optional(),
    message: z.any().optional(),
  })
  .refine(
    (value) => {
      if (value.status !== 200) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        let errorMessage = value.message;
        try {
          // Preprocess the string to add double quotes around keys and strings to be sent as JSON
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
          const preprocessedMessage = value.message
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            .replace(/'/g, '"')
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, no-useless-escape
            .replace(/([{,])(?:\s*)([A-Za-z0-9_\-]+?)\s*:/g, '$1"$2":')
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            .replace(/'/g, '"');

          // Parse the preprocessed string as JSON
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
          const parsedMessage = safeParseJson(preprocessedMessage);

          if (
            parsedMessage &&
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            parsedMessage.errors &&
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            parsedMessage.errors.length > 0
          ) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            errorMessage = parsedMessage.errors[0].message;
          }
        } catch (error) {
          console.error('Error parsing JSON message:', error);
          // Using the original message if parsing fails
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        throw new KnabError(errorMessage, 'BAD_GATEWAY');
      }
      return true;
    },
    {
      message: 'Status code must be 200',
    },
  );

type BE1ValidationResult<T> = { success: true; data?: z.infer<T> };

export const validateBE1ResponseWithError = <T extends ZodTypeAny>({
  schema,
  input,
}: {
  schema?: T;
  input: unknown;
}): BE1ValidationResult<T> => {
  try {
    const validatedResponse = BEIWrapperResponseSchema.parse(input);
    if (!schema) {
      return { success: true };
    }
    const validatedData = schema.parse(validatedResponse.data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof KnabError) {
      throw error;
    }
    throw new KnabError('Error from upstream server', 'BAD_GATEWAY');
  }
};
