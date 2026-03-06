import { Alert } from '@chakra-ui/react';
import { FormatToken } from '@/shared/formatters';
import { useEarnPosition } from '../hooks';

export const DepositPendingWarning = () => {
  const { positionData } = useEarnPosition();
  if (!positionData || positionData.strategyDepositOffsetInLockedEth <= 0n) {
    return null;
  }

  return (
    <Alert.Root status="warning">
      <Alert.Title>
        Your{' '}
        <FormatToken
          amount={positionData.strategyDepositOffsetInLockedEth}
          token="ETH"
        />{' '}
        deposit to Lido Earn strategy is pending. Additional deposits are not
        available until it's processed. This can take up to 24 hours.
      </Alert.Title>
    </Alert.Root>
  );
};
