import { Alert, Link } from '@chakra-ui/react';
import { FormatToken } from '@/shared/formatters';
import { useNavigation } from '@/shared/wrapper/navigation';
import { useEarnPosition } from '../hooks';

export const PositionHealthWarning = () => {
  const { positionData } = useEarnPosition();
  const { setMode } = useNavigation();
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
        <b>Your stVault position is unhealthy.</b> Strategy withdrawal input
        amounts are denominated as for healthy position for precision. Your
        actual position value is less by an equivalent of{' '}
        <FormatToken
          amount={positionData.assetShortfallInEth}
          token={'ETH'}
          fallback="N/A"
          trimEllipsis
        />{' '}
        and can be seen in the{' '}
        <Link
          variant="underline"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setMode('dashboard');
          }}
        >
          dashboard tab
        </Link>
        .
      </Alert.Title>
    </Alert.Root>
  );
};
