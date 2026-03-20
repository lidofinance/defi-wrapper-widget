import { Address, isAddressEqual } from 'viem';
import { usePublicClient } from 'wagmi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { useDefiWrapper } from '@/modules/defi-wrapper';
import { fetchDistribution } from '@/modules/vaults/api/fetch-report';
import { generateProofByIndex } from '@/modules/vaults/proof-generator';
import { useDappStatus } from '@/modules/web3';
import { getTokenInfo } from '@/modules/web3/utils';

export type RewardsInfoEntry = {
  previewClaim: bigint;
  rewardToken: `0x${string}`;
  rewardTokenSymbol: string;
  rewardTokenDecimals: number;
  claimableAmount: bigint;
  recipientUserAddress: `0x${string}`;
  proofData: readonly `0x${string}`[];
};

export const useRewards = (addressOverride?: Address) => {
  const { distributor } = useDefiWrapper();
  const { address: userAddress, chainId } = useDappStatus();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  const address = addressOverride ?? userAddress;

  const query = useQuery({
    queryKey: ['wrapper', 'rewards', { address, chainId }],
    enabled: !!address && !!distributor,
    queryFn: async () => {
      invariant(address, 'Wallet not connected');
      invariant(distributor, 'Distributor is not defined');

      const userAddresses = [address];
      const cid = await distributor.read.cid();

      if (!cid) return { rewardsInfo: [], isEmpty: true };

      const merkleTree = await fetchDistribution(cid);

      const rewardsInfo: RewardsInfoEntry[] = [];

      for (const [index, record] of merkleTree.values.entries()) {
        const recipientAddress = record.value[0] as Address;
        const rewardToken = record.value[1] as Address;
        const claimableAmount = BigInt(record.value[2]);

        const recipientUserAddress = userAddresses.find((addr) =>
          isAddressEqual(addr, recipientAddress),
        );

        if (!recipientUserAddress) {
          continue;
        }

        const { symbol, decimals } = await getTokenInfo(
          rewardToken,
          publicClient,
          queryClient,
        );

        const proof = generateProofByIndex(merkleTree, index);
        const proofData = proof?.proof;
        invariant(proofData, 'Proof is not defined');

        const previewClaim: bigint = await distributor.read.previewClaim([
          recipientUserAddress,
          rewardToken,
          claimableAmount,
          proofData,
        ]);

        if (previewClaim === 0n) {
          continue;
        }

        rewardsInfo.push({
          previewClaim,
          rewardToken,
          rewardTokenSymbol: symbol,
          rewardTokenDecimals: decimals,
          claimableAmount,
          recipientUserAddress,
          proofData,
        });
      }
      return { rewardsInfo, isEmpty: rewardsInfo.length === 0 };
    },
  });

  return {
    ...query,
    rewardsInfo: query.data?.rewardsInfo,
    isLoading: query.isLoading || query.isPending,
    isEmpty: query.data?.isEmpty,
  };
};
