import { isAddressEqual } from 'viem';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { USER_CONFIG } from '@/config';
import { useStvStrategy } from '@/modules/defi-wrapper';
import { useDappStatus, useLidoSDK } from '@/modules/web3';
import {
  getLidoEarnAsyncDepositQueueContract,
  getLidoEarnStrategyContract,
  getLidoEarnRedeemQueueContract,
  getLidoEarnShareManagerContract,
  getLidoEarnVaultContract,
} from '../contracts';

export const useEarnStrategy = () => {
  const { publicClient, wstETH } = useLidoSDK();
  const { address } = useDappStatus();
  const { wrapper, strategy, strategyId } = useStvStrategy();

  if (strategyId) {
    invariant(
      strategyId === 'strategy.mellow.v1',
      'Invalid strategyId for Lido Earn Strategy',
    );
  }

  return useQuery({
    queryKey: [
      'wrapper',
      wrapper?.address,
      'lido-earn-strategy',
      strategy?.address,
      { address, chainId: publicClient.chain?.id },
    ],
    enabled: !!wrapper && !!strategy,
    queryFn: async () => {
      invariant(wrapper, 'wrapper is required');
      invariant(strategy, 'strategy is required');

      const lidoEarnStrategy = getLidoEarnStrategyContract(
        strategy.address,
        publicClient,
      );

      const [
        strategyProxyAddress,
        wstethCanonicalAddress,
        asyncDepositQueueAddress,
        syncDepositQueueAddress,
        asyncRedeemQueueAddress,
        lidoEthEarnVaultAddress,
        oracleAddress,
        feeManagerAddress,
        shareManagerAddress,
        wstethAddress,
      ] = await Promise.all([
        address
          ? lidoEarnStrategy.read.getStrategyCallForwarderAddress([address])
          : undefined,
        wstETH.contractAddress(),
        lidoEarnStrategy.read.MELLOW_ASYNC_DEPOSIT_QUEUE(),
        lidoEarnStrategy.read.MELLOW_SYNC_DEPOSIT_QUEUE(),
        lidoEarnStrategy.read.MELLOW_ASYNC_REDEEM_QUEUE(),
        lidoEarnStrategy.read.MELLOW_VAULT(),
        lidoEarnStrategy.read.MELLOW_ORACLE(),
        lidoEarnStrategy.read.MELLOW_FEE_MANAGER(),
        lidoEarnStrategy.read.MELLOW_SHARE_MANAGER(),
        lidoEarnStrategy.read.WSTETH(),
      ]);

      invariant(
        isAddressEqual(wstethCanonicalAddress, wstethAddress),
        'wstETH address from strategy does not match wstETH address from SDK',
      );

      const asyncDepositQueue = getLidoEarnAsyncDepositQueueContract(
        asyncDepositQueueAddress,
        publicClient,
      );
      const asyncRedeemQueue = getLidoEarnRedeemQueueContract(
        asyncRedeemQueueAddress,
        publicClient,
      );

      const earnVault = getLidoEarnVaultContract(
        lidoEthEarnVaultAddress,
        publicClient,
      );

      const shareManager = getLidoEarnShareManagerContract(
        shareManagerAddress,
        publicClient,
      );

      const [SUPPLY_FEATURE, REDEEM_FEATURE] = await Promise.all([
        lidoEarnStrategy.read.REDEEM_FEATURE(),
        lidoEarnStrategy.read.SUPPLY_FEATURE(),
      ]);

      const [
        isSupplyPaused,
        isRedeemPaused,
        isAsyncDepositQueuePaused,
        isAsyncRedeemQueuePaused,
      ] = await Promise.all([
        lidoEarnStrategy.read.isFeaturePaused([SUPPLY_FEATURE]),
        lidoEarnStrategy.read.isFeaturePaused([REDEEM_FEATURE]),
        earnVault.read.isPausedQueue([asyncDepositQueueAddress]),
        earnVault.read.isPausedQueue([asyncRedeemQueueAddress]),
      ]);

      const isDepositPaused = isSupplyPaused || isAsyncDepositQueuePaused;
      const isWithdrawalPaused = isRedeemPaused || isAsyncRedeemQueuePaused;

      if (USER_CONFIG.isDev && typeof window !== 'undefined') {
        (window as any).__LIDO_EARN_STATIC_CONFIG__ = {
          strategyProxyAddress,
          wstethCanonicalAddress,
          asyncDepositQueueAddress,
          syncDepositQueueAddress,
          asyncRedeemQueueAddress,
          lidoEthEarnVaultAddress,
          oracleAddress,
          feeManagerAddress,
          shareManagerAddress,
          wstethAddress,
          state: {
            isDepositPaused,
            isWithdrawalPaused,
            isSupplyPaused,
            isRedeemPaused,
            isAsyncDepositQueuePaused,
            isAsyncRedeemQueuePaused,
          },
        };
        console.info(
          '__LIDO_EARN_STATIC_CONFIG__',
          (window as any).__LIDO_EARN_STATIC_CONFIG__,
        );
      }

      return {
        strategyProxyAddress,
        lidoEarnStrategy,
        asyncDepositQueue,
        asyncRedeemQueue,
        earnVault,
        shareManager,

        state: {
          isDepositPaused,
          isWithdrawalPaused,
          isSupplyPaused,
          isRedeemPaused,
          isAsyncDepositQueuePaused,
          isAsyncRedeemQueuePaused,
        },
      };
    },
  });
};
