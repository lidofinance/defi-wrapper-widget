import { Alert } from '@chakra-ui/react';
import { FormatToken } from '@/shared/formatters';
import { useEarnPosition } from '../hooks';

export const PositionHealthWarning = () => {
  const { positionData } = useEarnPosition();
  if (
    !positionData ||
    !positionData.isUnhealthy ||
    positionData.assetShortfallInEth <= 1000
  ) {
    return null;
  }

  return (
    <Alert.Root status="warning">
      <Alert.Title>
        Your stVault position is unhealthy. Strategy withdrawal amounts are
        denominated as for healthy position for precision. Your position value
        is less by an equivalent of{' '}
        <FormatToken
          amount={positionData?.assetShortfallInEth}
          token={'ETH'}
          fallback="N/A"
          trimEllipsis
        />{' '}
        and real position value can be seen in the dashboard tab.
      </Alert.Title>
    </Alert.Root>
  );
};
