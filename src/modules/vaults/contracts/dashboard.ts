import { type Address, getContract } from 'viem';

import { dashboardAbi } from '@/abi/dashboard-abi';
import type { RegisteredPublicClient } from '@/modules/web3';
import { getEncodable } from '@/utils/encodable';

// TODO: move to lido-sdk
export const getDashboardContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
) => {
  const client: {
    public: RegisteredPublicClient;
  } = {
    public: publicClient,
  };

  return getEncodable(
    getContract({
      address,
      abi: dashboardAbi,
      client,
    }),
  );
};
