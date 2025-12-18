import type { Token } from '@/types/token';

export const tokenLabel = (token: Token) => {
  switch (token) {
    case 'ETH':
      return 'ETH';
    case 'WETH':
      return 'wETH';
    case 'STETH':
      return 'stETH';
    case 'WSTETH':
      return 'wstETH';
  }
};
