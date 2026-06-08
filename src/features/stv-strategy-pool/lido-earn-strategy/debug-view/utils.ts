import { formatEther } from 'viem';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { useLidoSDK } from '@/modules/web3';

export type ChartItem = {
  name: string;
  value: number;
  formatted: string;
  color: string;
};

const FILLER_NAME = '__filler__';

const VALUE_NORMALIZER = 10n ** 9n;

export const toChartValue = (value: bigint | undefined): number =>
  value === undefined ? 0 : Number(value / VALUE_NORMALIZER);

const toDataNumber = (value: bigint | undefined) => {
  if (value === undefined) return { num: 0, formatted: '0' };
  return {
    num: toChartValue(value),
    formatted: formatEther(value),
  };
};

export type ChartReference = {
  value: number;
  label?: string;
};

export const toChartItem = (
  name: string,
  value: bigint | undefined,
  color: string,
): ChartItem => {
  const d = toDataNumber(value);
  return { name, value: d.num, formatted: d.formatted, color };
};

export const toChartReference = (
  name: string,
  value: bigint | undefined,
): ChartReference => {
  const d = toDataNumber(value);
  return { label: name, value: d.num };
};

export const max = (values: number[]): number => Math.max(...values);

export const itemsSum = (items: { value: number }[]): number =>
  items.reduce((acc, item) => acc + item.value, 0);

export const withFiller = (
  items: ChartItem[],
  maxTotal: number,
): ChartItem[] => {
  const filler = maxTotal - itemsSum(items);
  if (filler <= 0) return items;
  return [
    ...items,
    { name: FILLER_NAME, value: filler, formatted: '0', color: 'transparent' },
  ];
};

export const isFiller = (name: string): boolean => name === FILLER_NAME;

type BigintTuple<T extends readonly (bigint | undefined)[]> = {
  readonly [K in keyof T]: bigint;
};

export const useBatchToSteth = <
  const T extends readonly (bigint | undefined)[],
>(
  sharesAmounts: T | undefined,
) => {
  const { shares } = useLidoSDK();

  return useQuery({
    queryKey: ['batch-to-steth', sharesAmounts?.map(String)],
    enabled:
      sharesAmounts !== undefined &&
      sharesAmounts.every((v) => v !== undefined),
    queryFn: async (): Promise<BigintTuple<T>> => {
      invariant(sharesAmounts !== undefined, 'sharesAmounts is required');
      invariant(
        sharesAmounts.every((v) => v !== undefined),
        'all sharesAmounts must be defined',
      );
      return shares.convertBatchSharesToSteth(
        sharesAmounts as unknown as bigint[],
      ) as Promise<BigintTuple<T>>;
    },
  });
};
