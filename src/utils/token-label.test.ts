import { describe, it, expect } from 'vitest';
import { tokenLabel } from './token-label';

describe('tokenLabel', () => {
  it('ETH → "ETH"', () => expect(tokenLabel('ETH')).toBe('ETH'));
  it('WETH → "wETH"', () => expect(tokenLabel('WETH')).toBe('wETH'));
  it('STETH → "stETH"', () => expect(tokenLabel('STETH')).toBe('stETH'));
  it('WSTETH → "wstETH"', () => expect(tokenLabel('WSTETH')).toBe('wstETH'));
});
