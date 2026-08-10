import { ethAddress } from 'viem';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/config', () => ({
  getContractByAddress: vi.fn(),
}));

import { getContractByAddress } from '@/config';
import { getTokenByAddress } from './token-by-address';

const CHAINS_1 = 1 as any; // CHAINS enum value for mainnet

const mockGetContract = vi.mocked(getContractByAddress);

describe('getTokenByAddress', () => {
  it('returns STETH for lido contract', () => {
    mockGetContract.mockReturnValue('lido' as any);
    expect(getTokenByAddress('0x1234' as any, CHAINS_1)).toBe('STETH');
  });

  it('returns WSTETH for wsteth contract', () => {
    mockGetContract.mockReturnValue('wsteth' as any);
    expect(getTokenByAddress('0x1234' as any, CHAINS_1)).toBe('WSTETH');
  });

  it('returns WETH for weth contract', () => {
    mockGetContract.mockReturnValue('weth' as any);
    expect(getTokenByAddress('0x1234' as any, CHAINS_1)).toBe('WETH');
  });

  it('returns ETH for ethAddress when contract name falls to default case', () => {
    // The ETH path is the default switch case — reached when contractName is not null
    // but is not one of lido/wsteth/weth, AND address equals ethAddress
    mockGetContract.mockReturnValue('unknown-contract' as any);
    expect(getTokenByAddress(ethAddress, CHAINS_1)).toBe('ETH');
  });

  it('returns null when getContractByAddress returns null (no match)', () => {
    mockGetContract.mockReturnValue(null);
    expect(
      getTokenByAddress(
        '0x0000000000000000000000000000000000000001' as any,
        CHAINS_1,
      ),
    ).toBeNull();
  });

  it('returns null for default case when address is not ethAddress', () => {
    mockGetContract.mockReturnValue('unknown-contract' as any);
    expect(
      getTokenByAddress(
        '0x0000000000000000000000000000000000000001' as any,
        CHAINS_1,
      ),
    ).toBeNull();
  });
});
