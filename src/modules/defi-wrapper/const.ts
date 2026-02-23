import { Hex, keccak256, toHex } from 'viem';

export const STRATEGY_IDS = ['strategy.ggv.v1', 'strategy.mellow.v1'] as const;

export const BYTES_TO_STRATEGY_ID = STRATEGY_IDS.reduce<
  Record<Hex, (typeof STRATEGY_IDS)[number]>
>((acc, strategyId) => {
  acc[keccak256(toHex(strategyId))] = strategyId;
  return acc;
}, {});
