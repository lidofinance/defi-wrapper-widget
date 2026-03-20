import { Address, ethAddress, isAddressEqual } from 'viem';
import { CHAINS } from '@lidofinance/lido-ethereum-sdk';
import { getContractByAddress } from '@/config';
import { Token } from '@/types/token';

export const getTokenByAddress = (
  address: Address,
  chain: CHAINS,
): Token | null => {
  const contractName = getContractByAddress(chain, address);
  if (!contractName) return null;

  switch (contractName) {
    case 'lido':
      return 'STETH';
    case 'wsteth':
      return 'WSTETH';
    case 'weth':
      return 'WETH';
    default:
      if (isAddressEqual(address, ethAddress)) return 'ETH';
      return null;
  }
};
