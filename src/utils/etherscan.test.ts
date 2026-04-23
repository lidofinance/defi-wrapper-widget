import { describe, it, expect, vi } from 'vitest';

vi.mock('@/modules/web3/web3-provider/web3-provider', () => ({
  wagmiChainMap: {
    1: { blockExplorers: { default: { url: 'https://etherscan.io' } } },
    10: { blockExplorers: { default: { url: 'https://optimistic.etherscan.io' } } },
  },
}));

import {
  getEtherscanLink,
  getEtherscanAddressLink,
  ETHERSCAN_ENTITIES,
} from './etherscan';

describe('getEtherscanLink', () => {
  it('builds a tx link', () => {
    expect(getEtherscanLink(1, '0xabc', ETHERSCAN_ENTITIES.TX)).toBe(
      'https://etherscan.io/tx/0xabc',
    );
  });

  it('builds a token link', () => {
    expect(getEtherscanLink(1, '0xabc', ETHERSCAN_ENTITIES.TOKEN)).toBe(
      'https://etherscan.io/token/0xabc',
    );
  });

  it('builds an address link', () => {
    expect(getEtherscanLink(1, '0xabc', ETHERSCAN_ENTITIES.ADDRESS)).toBe(
      'https://etherscan.io/address/0xabc',
    );
  });

  it('uses correct explorer for a different chain', () => {
    expect(getEtherscanLink(10, '0xabc', ETHERSCAN_ENTITIES.TX)).toBe(
      'https://optimistic.etherscan.io/tx/0xabc',
    );
  });

  it('throws for an unknown chainId', () => {
    expect(() => getEtherscanLink(999, '0xabc', ETHERSCAN_ENTITIES.TX)).toThrow();
  });
});

describe('getEtherscanAddressLink', () => {
  it('builds an address link using the address entity', () => {
    expect(getEtherscanAddressLink(1, '0xabc')).toBe(
      'https://etherscan.io/address/0xabc',
    );
  });
});
