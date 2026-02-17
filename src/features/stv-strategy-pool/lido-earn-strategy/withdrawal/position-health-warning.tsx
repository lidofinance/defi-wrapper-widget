import { Alert } from '@chakra-ui/react';
import { FormatToken } from '@/shared/formatters';
import { useEarnPosition } from '../hooks';

export const PositionHealthWarning = () => {
  const { assetShortfallInEth, isUnhealthy } = useEarnPosition();
  if (!isUnhealthy && assetShortfallInEth && assetShortfallInEth > 1000) {
    return null;
  }

  return (
    <Alert.Root status="warning">
      <Alert.Title>
        Your stVault position is unhealthy. Your provided assets are shortfall
        of{' '}
        <FormatToken
          amount={assetShortfallInEth}
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
