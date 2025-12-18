import { type Address, isAddressEqual } from 'viem';
import { useEnsName, useEnsAddress } from 'wagmi';
import { useMainnetOnlyWagmi } from '@/modules/web3';

export const useSafeEnsName = (address?: Address) => {
  const { mainnetConfig } = useMainnetOnlyWagmi();

  const { data: ensName, ...ensNameQuery } = useEnsName({
    config: mainnetConfig,
    strict: true,
    address,
  });

  const { data: resolvedAddress, ...reverseEnsQuery } = useEnsAddress({
    name: ensName ?? undefined,
    config: mainnetConfig,
  });

  const isEnsVerified = !!(
    resolvedAddress &&
    address &&
    isAddressEqual(address, resolvedAddress)
  );

  return {
    ...ensNameQuery,
    ensName: isEnsVerified ? ensName : null,
    isLoading: ensNameQuery.isLoading || reverseEnsQuery.isLoading,
  };
};
