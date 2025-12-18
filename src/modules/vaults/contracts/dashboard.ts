import { type Address, getContract } from 'viem';

import { dashboardAbi } from '@/abi/dashboard-abi';
import type {
  RegisteredPublicClient,
  RegisteredWalletClient,
} from '@/modules/web3';
import { getEncodable } from '@/utils/encodable';

// TODO: move to lido-sdk
export const getDashboardContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
  walletClient?: RegisteredWalletClient,
) => {
  const client: {
    public: RegisteredPublicClient;
    wallet?: RegisteredWalletClient;
  } = {
    public: publicClient,
  };

  if (walletClient) {
    client.wallet = walletClient;
  }

  return getEncodable(
    getContract({
      address,
      abi: dashboardAbi,
      client,
    }),
  );
};
