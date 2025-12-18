import { useCallback } from 'react';

export const useConvertToUsd = (): ((tokenAmount: bigint) => number) => {
  const token = 'ETH';
  return useCallback(
    (tokenAmount: bigint): number => {
      if (token === 'ETH') {
        return +(Number(tokenAmount) * 3000).toFixed(2); // Assuming 1 ETH = $2000
      }
      if (token === 'WETH') {
        return +(Number(tokenAmount) * 100).toFixed(2); // Assuming 1 WETH = $100
      }
      return +Number(tokenAmount).toFixed(2);
    },
    [token],
  );
};
