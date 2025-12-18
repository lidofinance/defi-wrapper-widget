import { maxUint256 } from 'viem';
import type { Token } from '@/types/token';
import { ValidationError } from './validation-error';

// asserts only work with function declaration
// eslint-disable-next-line func-style
export function validateEtherAmount(
  field: string,
  amount: bigint | undefined | null,
  token: Token,
): asserts amount is bigint {
  // also checks undefined
  if (amount == null)
    throw new ValidationError(field, `Enter ${token} ${field} greater than 0`);

  if (amount <= 0n)
    throw new ValidationError(field, `Enter ${token} ${field} greater than 0`);

  if (amount > maxUint256)
    throw new ValidationError(field, `${token} ${field} is not valid`);
}
