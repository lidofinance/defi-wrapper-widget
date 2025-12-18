import { Alert } from '@chakra-ui/react';
import { FormatToken } from '@/shared/formatters';
import { useGGVStrategyPosition } from '../hooks/use-ggv-strategy-position';

export const PositionHealthWarning = () => {
  const { data: positionData } = useGGVStrategyPosition();
  if (
    !positionData ||
    !(positionData.isUnhealthy && positionData.assetShortfallInEth > 1000)
  ) {
    return null;
  }

  return (
    <Alert.Root status="warning">
      <Alert.Title>
        Your stVault position is unhealthy. Your provided assets are shortfall
        of{' '}
        <FormatToken
          amount={positionData.assetShortfallInEth}
          token={'ETH'}
          fallback="N/A"
          trimEllipsis={true}
        />{' '}
        to cover for strategy liabilities and your position will be rebalanced
        during stage 2 of withdrawal. Strategy withdrawal amounts are
        denominated as for healthy position.
      </Alert.Title>
    </Alert.Root>
  );
};
