import { useMemo } from 'react';
import { formatUnits } from 'viem';

export type FormatBalanceArgs = {
  maxDecimalDigits?: number;
  adaptiveDecimals?: boolean;
  maxTotalLength?: number;
  trimEllipsis?: boolean;
  tokenDecimals?: number;
};
const ETH_DECIMALS = 18;
export const formatBalance = (
  balance = 0n,
  {
    tokenDecimals = ETH_DECIMALS,
    maxDecimalDigits = 4,
    maxTotalLength,
    adaptiveDecimals,
    trimEllipsis,
  }: FormatBalanceArgs = {},
) => {
  let actual = formatUnits(balance, tokenDecimals);
  // the 'formatEther' from 'viem' returns without '.0' - decimals part (if the number is greater than 0 and does not have a decimal part)
  if (!actual.includes('.')) {
    actual += '.0';
  }

  let trimmed = actual;

  let isTrimmed = false;

  if (actual.includes('.')) {
    const parts = actual.split('.');
    const integer = parts[0];
    let decimal = parts[1];

    if (maxDecimalDigits > 0) {
      if (adaptiveDecimals) {
        const nonZeroIdx = decimal.split('').findIndex((v) => v !== '0');
        const sliceAt = Math.max(maxDecimalDigits, nonZeroIdx + 1);
        decimal = decimal.slice(0, sliceAt);
      } else {
        decimal = decimal.slice(0, maxDecimalDigits);
      }

      trimmed = `${integer}.${decimal}`;
      if (decimal.length < parts[1].length) {
        isTrimmed = true;
        if (trimEllipsis) trimmed += '...';
      }
    } else {
      trimmed = integer;
    }
  }

  if (maxTotalLength && trimmed.length > maxTotalLength - 3) {
    if (trimmed[maxTotalLength - 4] === '.') {
      trimmed = trimmed.slice(0, maxTotalLength - 4);
    } else {
      isTrimmed = true;
      trimmed = trimmed.slice(0, maxTotalLength - 3) + '...';
    }
  }

  const isTrimmedRepresentZero = trimmed
    .replace(/\./g, '')
    .split('')
    .every((v) => v === '0');

  return {
    actual,
    trimmed,
    isTrimmed,
    isTrimmedRepresentZero,
  };
};

export const useFormattedBalance: typeof formatBalance = (
  balance = 0n,
  {
    maxDecimalDigits = 4,
    maxTotalLength,
    tokenDecimals = ETH_DECIMALS,
    adaptiveDecimals,
    trimEllipsis,
  }: FormatBalanceArgs = {},
) => {
  return useMemo(
    () =>
      formatBalance(balance, {
        maxDecimalDigits,
        maxTotalLength,
        adaptiveDecimals,
        tokenDecimals,
        trimEllipsis,
      }),
    [
      adaptiveDecimals,
      tokenDecimals,
      balance,
      trimEllipsis,
      maxDecimalDigits,
      maxTotalLength,
    ],
  );
};
