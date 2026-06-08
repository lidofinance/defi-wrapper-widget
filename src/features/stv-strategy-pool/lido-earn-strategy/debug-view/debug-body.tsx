import { useState } from 'react';
import { formatEther } from 'viem';
import { BarSegment, useChart } from '@chakra-ui/charts';
import {
  Box,
  HStack,
  Span,
  Spinner,
  Stack,
  Switch,
  Text,
} from '@chakra-ui/react';
import { useStvStrategy, useVaultCapacity } from '@/modules/defi-wrapper';
import { useDappStatus } from '@/modules/web3';
import { factorMulBN, clampZeroBN, minBN } from '@/utils/bn';
import {
  useEarnPosition,
  useEarnStrategy,
  useStrategyWithdrawalRequestsRead,
} from '../hooks';
import {
  DebugInfoSection,
  DebugAddressRow,
  DebugBooleanRow,
  DebugRow,
} from './debug-info';
import {
  ChartItem,
  ChartReference,
  isFiller,
  itemsSum,
  toChartItem,
  useBatchToSteth,
  withFiller,
  toChartReference,
} from './utils';

type DebugChartProps = {
  title: string;
  items: ChartItem[];
  maxTotal: number;
  references?: ChartReference[];
  legend?: boolean;
  token?: string;
  minSegmentWidth?: boolean;
};

const DebugChart = ({
  title,
  items,
  maxTotal,
  references,
  legend = true,
  token = 'stETH',
  minSegmentWidth = true,
}: DebugChartProps) => {
  const chart = useChart({
    series: [{ name: 'value', color: 'blue.500' }],
    data: withFiller(items, maxTotal),
  });

  return (
    <Box>
      <Text textStyle="sm" fontWeight="semibold" mb="2" color="fg.muted">
        {title}
      </Text>
      <BarSegment.Root chart={chart as any}>
        <BarSegment.Content>
          <BarSegment.Bar
            css={minSegmentWidth ? { '& > div': { minWidth: '4px' } } : {}}
            tooltip={(props) => {
              const item = props.payload as ChartItem;
              if (chart.highlightedSeries !== item.name || isFiller(item.name))
                return null;
              return (
                <HStack
                  pos="absolute"
                  top="-8"
                  right="4"
                  bg="gray.800"
                  color="white"
                  textStyle="xs"
                  zIndex="1"
                  px="2.5"
                  py="1"
                  gap="1.5"
                  rounded="l2"
                  shadow="md"
                >
                  <Span>{item.name}</Span>
                  <Span fontFamily="mono" fontWeight="medium">
                    {item.formatted} {token}
                  </Span>
                </HStack>
              );
            }}
          >
            {references
              ?.slice()
              .sort((a, b) => a.value - b.value)
              .map((ref, i, arr) => (
                <BarSegment.Reference
                  key={i}
                  value={ref.value}
                  h={`${150 + (arr.length - 1 - i) * 50}%`}
                  label={ref.label}
                />
              ))}
          </BarSegment.Bar>
        </BarSegment.Content>
      </BarSegment.Root>
      {legend && (
        <HStack wrap="wrap" gap="4" textStyle="sm" mt="2">
          {items.map((item) => (
            <HStack key={item.name} gap="1.5">
              <Box w="2" h="2" rounded="full" bg={item.color} flexShrink="0" />
              <Span>{item.name}</Span>
              <Span fontFamily="mono" fontWeight="medium">
                {item.formatted} {token}
              </Span>
            </HStack>
          ))}
        </HStack>
      )}
    </Box>
  );
};

export const DebugBody = () => {
  const [showZeroValues, setShowZeroValues] = useState(false);

  const { address } = useDappStatus();
  const {
    isLoading: isStvStrategyLoading,
    error: stvStrategyError,
    ...stvStrategy
  } = useStvStrategy();
  const { isLoading: isWithdarawalRequestsLoading, withdrawalRequests } =
    useStrategyWithdrawalRequestsRead(true);
  const {
    data: earnStrategy,
    error: earnStrategyError,
    isLoading: isEarnStrategyLoading,
  } = useEarnStrategy();
  const {
    data: vaultCapacity,
    error: vaultCapacityError,
    isLoading: isVaultCapacityLoading,
  } = useVaultCapacity();
  const { positionData, positionQuery, isPositionLoading } = useEarnPosition();

  const {
    data: batchToStethData,
    isLoading: isBatchSharesLoading,
    error: batchToStethError,
  } = useBatchToSteth([
    positionData?.pendingDepositsInWsteth,
    positionData?.balanceInWsteth,
    positionData?.claimableDepositInWsteth,
    positionData?.pendingWithdrawalsInWsteth,
    positionData?.totalStrategyBalanceInStethShares,
  ] as const);

  const queryError =
    positionQuery.error ||
    vaultCapacityError ||
    batchToStethError ||
    earnStrategyError ||
    stvStrategyError;
  const isLoading =
    isPositionLoading ||
    isVaultCapacityLoading ||
    isWithdarawalRequestsLoading ||
    isBatchSharesLoading ||
    isEarnStrategyLoading ||
    isStvStrategyLoading;

  if (queryError) {
    return (
      <Box p="4" color="red.500">
        Error: {queryError.message}
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box p="4">
        <Spinner />
      </Box>
    );
  }

  if (
    !positionData ||
    !vaultCapacity ||
    !withdrawalRequests ||
    !batchToStethData ||
    !earnStrategy ||
    !stvStrategy
  ) {
    return <Box p="4">Queries not enabled</Box>;
  }

  const [
    earnPendingDepositsSteth,
    earnBalanceSteth,
    earnClaimableDepositSteth,
    earnPendingWithdrawalsSteth,
    earnTotalBalanceInSteth,
  ] = batchToStethData;

  const totalStethDelegated = clampZeroBN(
    positionData.totalMintedSteth - positionData.stethOnBalance,
  );

  const shortfallStethFromDeposited = clampZeroBN(
    totalStethDelegated - earnTotalBalanceInSteth,
  );

  // clamped to zero as max avaliable liability can be more then minted if the position is repaid/overcollateralized
  const totalStethToHeal = clampZeroBN(
    positionData.totalMintedSteth - positionData.maxLiabilityAvailableSteth,
  );

  const stethRepaidToHeal = minBN(positionData.stethToRepay, totalStethToHeal);
  const stethRepaidToUnlock = positionData.stethToRepay - stethRepaidToHeal;

  // EARN position

  const earnItems: ChartItem[] = [
    toChartItem('Pending Deposits', earnPendingDepositsSteth, 'teal.solid'),
    toChartItem('Balance', earnBalanceSteth, 'blue.solid'),
    toChartItem('Claimable Deposit', earnClaimableDepositSteth, 'orange.solid'),
    toChartItem(
      'Pending Withdrawals',
      earnPendingWithdrawalsSteth,
      'purple.solid',
    ),
  ];

  // Liability position
  const liabilityItems: ChartItem[] = [
    toChartItem('In lido earn', earnTotalBalanceInSteth, 'teal.solid'),

    toChartItem(
      'Processable withdrawal (Repay, Heal)',
      stethRepaidToHeal,
      'blue.emphasized',
    ),
    toChartItem(
      'Processable withdrawal (Repay,Unlock)',
      stethRepaidToUnlock,
      'green.emphasized',
    ),
    toChartItem(
      'Processable withdrawal (Rebalance)',
      positionData.stethToRebalance,
      'red.solid',
    ),
    toChartItem(
      'Processable withdrawal (Recover)',
      positionData.stethToRecover,
      'green.solid',
    ),
  ];

  const liabilityReferences: ChartReference[] = [
    toChartReference(
      `Max liability by current collateral -${formatEther(positionData.maxLiabilityAvailableSteth)} stETH`,
      positionData.maxLiabilityAvailableSteth,
    ),
    toChartReference(
      `Total liability minted - ${formatEther(positionData.totalMintedSteth)} stETH`,
      positionData.totalMintedSteth,
    ),
  ];

  // Proxy position

  const proxyItems: ChartItem[] = [
    toChartItem(
      'Deposited to Lido Earn(returnable)',
      totalStethDelegated,
      'purple.solid',
    ),
    ...(shortfallStethFromDeposited > 0n
      ? [
          toChartItem(
            'Unavailable to return(shortfall from deposited)',
            shortfallStethFromDeposited,
            'red.600',
          ),
        ]
      : []),
    toChartItem('On proxy balance', positionData.stethOnBalance, 'blue.solid'),
    toChartItem(
      'Excess (can be withdrawn directly)',
      positionData.strategyStethSharesExcess,
      'green.solid',
    ),
  ];

  const ethToBeUnlocked = minBN(
    positionData.stethLiabilityToRepayInEth,
    positionData.withdrawableEthAfterRepay,
  );

  const ethShortfall =
    positionData.stethLiabilityToRepayInEth - ethToBeUnlocked;

  const lockedInEarn =
    positionData.lockedEthForTotalMintedSteth -
    positionData.totalValuePendingFromStrategyVaultInEth -
    ethToBeUnlocked -
    positionData.stethToRebalance -
    ethShortfall;

  // User value position change

  const userValueChangeItems: ChartItem[] = [
    toChartItem('Locked in Earn', lockedInEarn, 'red.600'),
    toChartItem(
      'Pending withdrawal from Earn',
      positionData.totalValuePendingFromStrategyVaultInEth,
      'orange.solid',
    ),
    toChartItem(
      'Process withdrawal - to be unlocked',
      positionData.withdrawableEthAfterRepay,
      'green.solid',
    ),
    ...(ethShortfall > 0n
      ? [toChartItem('Missing collateral', ethShortfall, 'red.800')]
      : []),
    toChartItem(
      'Process withdrawal - to be rebalanced',
      positionData.stethToRebalance,
      'gray.solid',
    ),
  ];

  // User value position

  const [pendingStVaultWithdrawals, claimableStVaultWithdrawals] =
    withdrawalRequests.reduce(
      (acc, req) => {
        if (!req.isClaimable) {
          return [acc[0] + req.assets, acc[1]];
        }
        return [acc[0], acc[1] + req.assets];
      },
      [0n, 0n],
    );

  const userValueItems: ChartItem[] = [
    toChartItem(
      'Locked user balance',
      positionData.proxyBalanceStvInEth -
        positionData.proxyUnlockedBalanceStvInEth,
      'orange.600',
    ),
    toChartItem(
      'Unlocked user balance',
      positionData.proxyUnlockedBalanceStvInEth,
      'green.solid',
    ),

    toChartItem(
      'Excess Earn rewards (can be collected directly)',
      positionData.strategyVaultStethExcess,
      'green.muted',
    ),

    ...(positionData.assetShortfallInEth > 0n
      ? [
          toChartItem(
            'Asset Shortfall (How much more collateral is needed for healthy position)',
            positionData.assetShortfallInEth,
            'red.800',
          ),
        ]
      : []),
    toChartItem(
      'Pending vault withdrawals',
      pendingStVaultWithdrawals,
      'orange.muted',
    ),
    toChartItem(
      'Claimable vault withdrawals',
      claimableStVaultWithdrawals,
      'orange.solid',
    ),
  ];

  const rrCapUnit = 1 - vaultCapacity.reserveRatioUnit;

  const referenceAtRR = factorMulBN(
    positionData.proxyBalanceStvInEth,
    rrCapUnit,
  );

  const forceRebalanceUnit = 1 - vaultCapacity.poolForcedRebalanceThresholdUnit;

  const referenceAtForcedRebalance = factorMulBN(
    positionData.proxyBalanceStvInEth,
    forceRebalanceUnit,
  );

  const actualRRUnit =
    1 - (vaultCapacity.reserveRatioUnit - vaultCapacity.reserveRatioGapUnit);

  const actualRRreference = factorMulBN(
    positionData.proxyBalanceStvInEth,
    actualRRUnit,
  );

  const userValueReferences: ChartReference[] = [
    toChartReference(`RR cap(${rrCapUnit * 100}%)`, referenceAtRR),
    toChartReference(
      `Forced Rebalance(${forceRebalanceUnit * 100}%)`,
      referenceAtForcedRebalance,
    ),
    toChartReference(`Vault RR cap(${actualRRUnit * 100}%)`, actualRRreference),
  ];

  const filterZeros = <T extends { value: number }>(items: T[]): T[] =>
    showZeroValues ? items : items.filter((item) => item.value !== 0);

  const filteredEarnItems = filterZeros(earnItems);
  const filteredLiabilityItems = filterZeros(liabilityItems);
  const filteredProxyItems = filterZeros(proxyItems);
  const filteredUserValueItems = filterZeros(userValueItems);
  const filteredUserChangeItems = filterZeros(userValueChangeItems);

  // For each chart we calculate max of their sums, stabilizing values
  const maxTotal = Math.max(
    ...[
      itemsSum(filteredEarnItems),
      itemsSum(filteredProxyItems),
      itemsSum(filteredUserValueItems),
      itemsSum(filteredLiabilityItems),
      itemsSum(filteredUserChangeItems),
    ],
  );

  return (
    <Box p="4">
      <HStack justify="flex-end" mb="4">
        <Switch.Root
          checked={showZeroValues}
          onCheckedChange={(e) => setShowZeroValues(e.checked)}
          size="sm"
        >
          <Switch.HiddenInput />
          <Switch.Control />
          <Switch.Label>
            <Text textStyle="sm" color="fg.muted">
              Display ~0 values (brakes proportions)
            </Text>
          </Switch.Label>
        </Switch.Root>
      </HStack>
      <Stack gap="10">
        <DebugChart
          title="Earn Position"
          items={filteredEarnItems}
          maxTotal={maxTotal}
          token="stETH"
          minSegmentWidth={showZeroValues}
        />
        <DebugChart
          title="Liability Position"
          items={filteredLiabilityItems}
          maxTotal={maxTotal}
          token="stETH"
          minSegmentWidth={showZeroValues}
          references={!showZeroValues ? liabilityReferences : []}
        />
        <DebugChart
          title="Proxy Balance Position"
          items={filteredProxyItems}
          maxTotal={maxTotal}
          token="stETH"
          minSegmentWidth={showZeroValues}
        />
        <DebugChart
          title="Eth position to change"
          items={filteredUserChangeItems}
          // only correctly displayed when zero values are hidden
          references={!showZeroValues ? userValueReferences : []}
          maxTotal={maxTotal}
          token="ETH"
          minSegmentWidth={showZeroValues}
        />
        <DebugChart
          title="Eth value Position"
          items={filteredUserValueItems}
          // only correctly displayed when zero values are hidden
          references={!showZeroValues ? userValueReferences : []}
          maxTotal={maxTotal}
          token="ETH"
          minSegmentWidth={showZeroValues}
        />
        <DebugInfoSection title="Vault Addresses">
          <DebugAddressRow label="User" address={address} />
          <DebugAddressRow
            label="Strategy Proxy (user)"
            address={earnStrategy?.strategyProxyAddress}
          />
          <DebugAddressRow
            label="Lido Earn Strategy"
            address={earnStrategy?.lidoEarnStrategy.address}
          />
          <DebugAddressRow
            label="Wrapper"
            address={stvStrategy.wrapper?.address}
          />
          <DebugAddressRow
            label="stVault"
            address={stvStrategy.stakingVault?.address}
          />
        </DebugInfoSection>
        <DebugInfoSection title="Vault Params">
          <DebugRow label="RR">{vaultCapacity.reserveRatioPercent}%</DebugRow>
          <DebugRow label="Force Rebalance Threshold">
            {vaultCapacity.poolForcedRebalanceThresholdPercent}%
          </DebugRow>
          <DebugRow label="Vault RR">
            {vaultCapacity.reserveRatioPercent -
              vaultCapacity.reserveRatioGapPercent}
            %
          </DebugRow>
        </DebugInfoSection>
        <DebugInfoSection title="Pause State">
          <DebugBooleanRow
            label="Deposit paused"
            value={earnStrategy?.state.isDepositPaused ?? false}
          />
          <DebugBooleanRow
            label="Withdrawal paused"
            value={earnStrategy?.state.isWithdrawalPaused ?? false}
          />
          <DebugBooleanRow
            label="Supply feature paused"
            value={earnStrategy?.state.isSupplyPaused ?? false}
          />
          <DebugBooleanRow
            label="Redeem feature paused"
            value={earnStrategy?.state.isRedeemPaused ?? false}
          />
          <DebugBooleanRow
            label="Async deposit queue paused"
            value={earnStrategy?.state.isAsyncDepositQueuePaused ?? false}
          />
          <DebugBooleanRow
            label="Async redeem queue paused"
            value={earnStrategy?.state.isAsyncRedeemQueuePaused ?? false}
          />
        </DebugInfoSection>
        <DebugInfoSection title="Lido Earn Contracts">
          <DebugAddressRow
            label="Earn Vault"
            address={earnStrategy?.earnVault.address}
          />
          <DebugAddressRow
            label="Share Manager"
            address={earnStrategy?.shareManager.address}
          />
          <DebugAddressRow
            label="Async Deposit Queue"
            address={earnStrategy?.asyncDepositQueue.address}
          />
          <DebugAddressRow
            label="Async Redeem Queue"
            address={earnStrategy?.asyncRedeemQueue.address}
          />
        </DebugInfoSection>
      </Stack>
    </Box>
  );
};
