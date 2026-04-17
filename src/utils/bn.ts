export const PRECISION_DECIMALS = 18;

export const minBN = (...values: (bigint | undefined | null)[]): bigint => {
  const validValues = values.filter((v) => v != null) as bigint[];
  if (validValues.length === 0) {
    throw new Error('All values are null or undefined');
  }
  return validValues.reduce((min, current) => (current < min ? current : min));
};

export const maxBN = (...values: (bigint | undefined | null)[]): bigint => {
  const validValues = values.filter((v) => v != null) as bigint[];
  if (validValues.length === 0) {
    throw new Error('All values are null or undefined');
  }
  return validValues.reduce((max, current) => (current > max ? current : max));
};

export const clampZeroBN = (value: bigint): bigint => {
  return value < 0n ? 0n : value;
};

export const bnAmountToNumber = (
  amount?: bigint | null,
  precision = PRECISION_DECIMALS,
): number => {
  return Number(amount) / 10 ** precision;
};

export const numberToBN = (
  value: number,
  precision = PRECISION_DECIMALS,
): bigint => {
  if (!Number.isFinite(value)) {
    throw new Error('Value must be a finite number');
  }
  return BigInt(Math.floor(value * 10 ** precision));
};

export const bnCeilDiv = (numerator: bigint, denominator: bigint): bigint => {
  if (denominator === 0n) {
    throw new RangeError('Division by zero');
  }

  const quotient = numerator / denominator;
  const remainder = numerator % denominator;

  // If there is a remainder and the result is positive, add 1 to round up.
  // We check if inputs have the same sign to determine if the result is positive.
  if (remainder !== 0n && numerator > 0n === denominator > 0n) {
    return quotient + 1n;
  }

  return quotient;
};

export const divideBN = (
  a: bigint,
  b: bigint,
  precision = PRECISION_DECIMALS,
): bigint => {
  if (b === 0n) {
    throw new Error('Division by zero');
  }
  const precisionFactor = 10n ** BigInt(precision);
  return (a * precisionFactor) / b;
};

export const factorMulBN = (
  a: bigint,
  factor: number,
  precision = PRECISION_DECIMALS,
): bigint => {
  const factorBN = numberToBN(factor, precision);
  return (a * factorBN) / 10n ** BigInt(precision);
};

export const isEqualEpsilonBN = (
  a: bigint,
  b: bigint,
  epsilonBN: bigint = 1000n,
) => {
  const diff = a - b;
  if (diff > 0) {
    return diff < epsilonBN;
  } else {
    return -diff < epsilonBN;
  }
};

export const absBN = (a: bigint): bigint => {
  return a < 0n ? -a : a;
};

export const signBN = (a: bigint): -1n | 0n | 1n => {
  if (a > 0n) {
    return 1n;
  } else if (a < 0n) {
    return -1n;
  } else {
    return 0n;
  }
};
