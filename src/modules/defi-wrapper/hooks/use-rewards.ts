import { Address } from 'viem';
import { usePublicClient } from 'wagmi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { useDefiWrapper } from '@/modules/defi-wrapper';
import { fetchDistribution } from '@/modules/vaults/api/fetch-report';
import { generateProofByIndex } from '@/modules/vaults/proof-generator';
import { useDappStatus } from '@/modules/web3';
import { getTokenInfo } from '@/modules/web3/utils';

export const useRewards = () => {
  const { distributor } = useDefiWrapper();
  const { address, chainId } = useDappStatus();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['wrapper', 'rewards', { address, chainId }],
    enabled: !!address && !!distributor,
    queryFn: async () => {
      invariant(address, 'Wallet not connected');
      invariant(distributor, 'Distributor is not defined');

      const cid = await distributor.read.cid();

      if (!cid) return { rewardsInfo: [], isEmpty: true };

      const merkleTree = await fetchDistribution(cid);

      const rewardsInfo = [];

      for (const [index, record] of merkleTree.values.entries()) {
        const recipientAddress = record.value[0] as Address;
        const rewardToken = record.value[1] as Address;
        const claimableAmount = BigInt(record.value[2]);

        if (recipientAddress !== address) {
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
          address,
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
