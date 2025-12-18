import { type Address, isAddress } from 'viem';
import { z } from 'zod';

const validateAddress = (value: string | null) => !!(value && isAddress(value));

export const addressSchema = z
  .string()
  .min(1, {
    message: 'Address is required',
  })
  .trim()
  .transform((value) => value.toLocaleLowerCase() as Address)
  .refine(validateAddress, {
    message: 'Invalid ethereum address',
  });
