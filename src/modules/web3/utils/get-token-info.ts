import { Address, getContract } from 'viem';
import { erc20abi } from '@lidofinance/lido-ethereum-sdk/erc20';
import { QueryClient } from '@tanstack/query-core';
import type { RegisteredPublicClient } from '@/modules/web3';

export type TokenInfo = { symbol: string; decimals: number };
// This is the main function that should be used to get token symbols
export const getTokenInfo = async (
  tokenAddress: Address,
  publicClient: RegisteredPublicClient,
  queryClient: QueryClient,
): Promise<TokenInfo> => {
  // Define the query key for caching
  const queryKey = ['token-symbol', tokenAddress, publicClient];

  // Check if we have cached data
  const cachedData = queryClient.getQueryData<TokenInfo>(queryKey);
  if (cachedData) {
    return cachedData;
  }

  // If no cached data, fetch it and cache it
  const tokenContract = getContract({
    address: tokenAddress,
    abi: erc20abi,
    client: {
      public: publicClient,
    },
  });

  const symbol = await tokenContract.read.symbol();
  const decimals = await tokenContract.read.decimals();

  const data = { symbol, decimals };
  // Cache the result
  queryClient.setQueryData(queryKey, data);

  return data;
};
