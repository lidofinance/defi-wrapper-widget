import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { USER_CONFIG } from '@/config';
import { useStvStrategy } from '@/modules/defi-wrapper';
import { useDappStatus, useLidoSDK } from '@/modules/web3';
import {
  getGGVBoringQueueContract,
  getGGVStrategyContract,
  getGGVTellerContract,
  getGGVVaultContract,
} from '../contracts';

export const useGGVStrategy = () => {
  const { publicClient, stETH, shares } = useLidoSDK();
  const { address } = useDappStatus();
  const { wrapper, strategy, strategyId } = useStvStrategy();

  if (strategyId) {
    invariant(
      strategyId === 'strategy.ggv.v1',
      'Invalid strategyId for GGV Strategy',
    );
  }

  return useQuery({
    queryKey: [
      'wrapper',
      wrapper?.address,
      'ggv-strategy',
      strategy?.address,
      { address, chainId: publicClient.chain?.id },
    ],
    enabled: !!wrapper && !!strategy,
    queryFn: async () => {
      invariant(wrapper, 'wrapper is required');
      invariant(strategy, 'strategy is required');

      const ggvStrategyContract = getGGVStrategyContract(
        strategy.address,
        publicClient,
      );

      const [
        strategyProxyAddress,
        ggvQueueAddress,
        ggvTellerAddress,
        wstethAddress,
        stethAddress,
      ] = await Promise.all([
        address
          ? ggvStrategyContract.read.getStrategyCallForwarderAddress([address])
          : undefined,

        ggvStrategyContract.read.BORING_QUEUE(),
        ggvStrategyContract.read.TELLER(),
        ggvStrategyContract.read.WSTETH(),
        stETH.contractAddress(),
      ]);

      const ggvTeller = getGGVTellerContract(ggvTellerAddress, publicClient);
      const ggvQueue = getGGVBoringQueueContract(ggvQueueAddress, publicClient);
      const ggvVaultAddress = await ggvTeller.read.vault();
      const [
        allowWithdrawals,
        secondsToMaturity,
        minimumSecondsToDeadline,
        minDiscount,
        maxDiscount,
        minimumGGVShares,
        withdrawCapacity,
      ] = await ggvQueue.read.withdrawAssets([wstethAddress]);

      const minimumGGVSharesInStethShares =
        await ggvQueue.read.previewAssetsOut([
          wstethAddress,
          minimumGGVShares,
          minDiscount,
        ]);

      const minimumGGVSharesInSteth = await shares.convertToSteth(
        minimumGGVSharesInStethShares,
      );

      if (USER_CONFIG.isDev && typeof window !== 'undefined') {
        (window as any).__GGV_STATIC_CONFIG__ = {
          ggvStrategyAddress: strategy.address,
          strategyProxyAddress,
          ggvVaultAddress,
          ggvQueueAddress,
          ggvTellerAddress,
          stethAddress,
          wstethAddress,
          withdrawParams: {
            allowWithdrawals,
            secondsToMaturity,
            minimumSecondsToDeadline,
            minDiscount,
            maxDiscount,
            minimumGGVShares,
            minimumGGVSharesInSteth,
            minimumGGVSharesInStethShares,
            withdrawCapacity,
          },
        };
        console.info(
          '__GGV_STATIC_CONFIG__',
          (window as any).__GGV_STATIC_CONFIG__,
        );
      }

      return {
        ggvStrategyContract,
        strategyProxyAddress,
        ggvTeller,
        ggvVault: getGGVVaultContract(ggvVaultAddress, publicClient),
        ggvQueue,
        withdrawParams: {
          allowWithdrawals,
          secondsToMaturity,
          minimumSecondsToDeadline,
          minDiscount,
          maxDiscount,
          minimumGGVShares,
          minimumGGVSharesInSteth,
          minimumGGVSharesInStethShares,
          withdrawCapacity,
        },
      };
    },
  });
};
