import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { useDefiWrapper } from '@/modules/defi-wrapper';
import { useDappStatus } from '@/modules/web3';

export const useRequests = () => {
  const { address, chainId } = useDappStatus();
  const { withdrawalQueue } = useDefiWrapper();

  return useQuery({
    queryKey: ['wrapper', 'withdrawal-requests', { address, chainId }],
    enabled: !!address && !!withdrawalQueue,
    queryFn: async () => {
      invariant(address, 'Wallet not connected');
      invariant(withdrawalQueue, 'Withdrawal queue not available');

      const ids = await withdrawalQueue.read.withdrawalRequestsOf([address]);
      const requests = await withdrawalQueue.read.getWithdrawalStatusBatch([
        ids,
      ]);

      const requestsWithId = requests
        .map((r, i) => ({ id: ids[i], ...r }))
        .sort((r1, r2) => (r1.id > r2.id ? 1 : -1));

      const pending = requestsWithId.filter((r) => !r.isFinalized);
      const finalized = requestsWithId.filter(
        (r) => r.isFinalized && !r.isClaimed,
      );
      const lastCheckpoint =
        await withdrawalQueue.read.getLastCheckpointIndex();

      const hints = await withdrawalQueue.read.findCheckpointHintBatch([
        finalized.map((r) => r.id),
        1n,
        lastCheckpoint,
      ]);

      const finalizedWithHints = finalized.map((r, i) => ({
        ...r,
        checkpointHint: hints[i],
      }));

      const isEmpty = requestsWithId.length === 0;

      return { pending, finalized: finalizedWithHints, isEmpty };
    },
  });
};
