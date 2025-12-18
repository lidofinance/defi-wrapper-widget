import { ZodError } from 'zod';

export const isZodError = (error: unknown): error is ZodError => {
  if (error instanceof ZodError) {
    return Array.isArray(error?.errors);
  }

  return false;
};
