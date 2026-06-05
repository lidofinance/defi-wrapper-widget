import { useState } from 'react';
import { BarSegment, useChart } from '@chakra-ui/charts';
import { Box, HStack, Span, Spinner, Switch, Text } from '@chakra-ui/react';
import { useVaultCapacity } from '@/modules/defi-wrapper';
import { factorMulBN } from '@/utils/bn';
import { useEarnPosition, useStrategyWithdrawalRequestsRead } from '../hooks';
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
                  bg="bg.panel"
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
            {references?.map((ref, i) => (
              <BarSegment.Reference
                key={i}
                value={ref.value}
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
  const { isLoading: isWithdarawalRequestsLoading, withdrawalRequests } =
    useStrategyWithdrawalRequestsRead(true);
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
    positionData.totalStrategyBalanceInStethShares,
  ] as const);

  const queryError =
    positionQuery.error || vaultCapacityError || batchToStethError;
  const isLoading =
    isPositionLoading ||
    isVaultCapacityLoading ||
    isWithdarawalRequestsLoading ||
    isBatchSharesLoading;

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
    !batchToStethData
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

  // Proxy position

  const proxyItems: ChartItem[] = [
    toChartItem('Deposited into Earn', earnTotalBalanceInSteth, 'purple.solid'),
    toChartItem('On proxy balance', positionData.stethOnBalance, 'blue.solid'),
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
      'red.600',
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

  const referenceAtRR = factorMulBN(
    positionData.proxyBalanceStvInEth,
    1 - vaultCapacity.reserveRationUnit,
  );

  const userValueReferences: ChartReference[] = [
    toChartReference('RR cap', referenceAtRR),
  ];

  const filterZeros = <T extends { value: number }>(items: T[]): T[] =>
    showZeroValues ? items : items.filter((item) => item.value !== 0);

  const filteredEarnItems = filterZeros(earnItems);
  const filteredProxyItems = filterZeros(proxyItems);
  const filteredUserValueItems = filterZeros(userValueItems);

  // For each chart we calculate max of their sums, stabilizing values
  const maxTotal = Math.max(
    ...[
      itemsSum(filteredEarnItems),
      itemsSum(filteredProxyItems),
      itemsSum(filteredUserValueItems),
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
              Display 0 values
            </Text>
          </Switch.Label>
        </Switch.Root>
      </HStack>
      <DebugChart
        title="Earn Position"
        items={filteredEarnItems}
        maxTotal={maxTotal}
        token="stETH"
        minSegmentWidth={showZeroValues}
      />
      <DebugChart
        title="Proxy Position"
        items={filteredProxyItems}
        maxTotal={maxTotal}
        token="stETH"
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
    </Box>
  );
};
