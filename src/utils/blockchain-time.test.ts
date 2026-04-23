import { describe, it, expect } from 'vitest';
import { fromBlockChainTime, toBlockChainTime } from './blockchain-time';

describe('fromBlockChainTime', () => {
  it('converts 0 to epoch', () => {
    expect(fromBlockChainTime(0n)).toEqual(new Date(0));
  });

  it('converts seconds to milliseconds correctly', () => {
    // Unix timestamp 1_000_000_000 = 2001-09-09T01:46:40.000Z
    expect(fromBlockChainTime(1_000_000_000n).getTime()).toBe(
      1_000_000_000 * 1000,
    );
  });

  it('returns a Date instance', () => {
    expect(fromBlockChainTime(1n)).toBeInstanceOf(Date);
  });
});

describe('toBlockChainTime', () => {
  it('converts epoch to 0n', () => {
    expect(toBlockChainTime(new Date(0))).toBe(0n);
  });

  it('converts milliseconds to seconds (floors)', () => {
    // 1500 ms → 1 second (floor)
    expect(toBlockChainTime(new Date(1500))).toBe(1n);
  });

  it('returns a bigint', () => {
    expect(typeof toBlockChainTime(new Date())).toBe('bigint');
  });
});

describe('fromBlockChainTime / toBlockChainTime roundtrip', () => {
  it('roundtrip is identity (seconds granularity)', () => {
    const ts = 1_700_000_000n; // 2023-11-14
    expect(toBlockChainTime(fromBlockChainTime(ts))).toBe(ts);
  });
});
