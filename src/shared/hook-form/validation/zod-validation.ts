import { type Address, isAddress } from 'viem';
import { z } from 'zod';
import { formatBalance } from '@/utils/formatBalance';

const validateAddress = (value: string | null) => !!(value && isAddress(value));

const TOKENS = {
  ETH: 'ETH',
  WETH: 'WETH',
  STETH: 'STETH',
  WSTETH: 'WSTETH',
} as const;

const amountSchema = z
  .bigint({ message: 'Amount is required' })
  .gt(0n, 'Amount must be at least 1 wei');

const maxBalanceSchema = (balance: bigint) =>
  amountSchema.lte(balance, `Amount must not be larger then your balance`);

export type TOKEN_VALUE_TYPE = keyof typeof TOKENS;

export type DEPOSIT_TOKENS_VALUE_TYPE = z.infer<typeof depositTokenSchema>;
export type MINT_TOKENS_VALUE_TYPE = z.infer<typeof mintTokenSchema>;

export const addressSchema = z
  .string()
  .trim()
  .transform((value) => value.toLocaleLowerCase() as Address)
  .refine(validateAddress, {
    message: 'Invalid address',
  }) as z.ZodType<Address>;

export const depositTokenSchema = z.enum([TOKENS.ETH, TOKENS.WETH]);

export const mintTokenSchema = z.enum([TOKENS.STETH, TOKENS.WSTETH]);

export const tokenAmountSchema = (
  balance: bigint,
  maxAmount?: bigint,
  maxAmountMessage?: string,
) => {
  let schema = maxBalanceSchema(balance);

  if (maxAmount !== undefined) {
    schema = schema.lte(
      maxAmount,
      maxAmountMessage ||
        `Amount must not be larger than ${formatBalance(maxAmount)}`,
    );
  }

  return schema;
};
