import { type Address, getContract, GetContractReturnType } from 'viem';

import { DashboardAbi, DashboardAbiType } from '@/abi/dashboard-abi';
import type { RegisteredPublicClient } from '@/modules/web3';
import { getEncodable } from '@/utils/encodable';

// TODO: move to lido-sdk
export const getDashboardContract = (
  address: Address,
  publicClient: RegisteredPublicClient,
): GetContractReturnType<DashboardAbiType, RegisteredPublicClient> => {
  const client: {
    public: RegisteredPublicClient;
  } = {
    public: publicClient,
  };

  return getEncodable(
    getContract({
      address,
      abi: DashboardAbi,
      client,
    }),
  );
};
