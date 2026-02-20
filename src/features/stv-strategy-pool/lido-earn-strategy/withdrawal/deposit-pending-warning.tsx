import { Alert } from '@chakra-ui/react';
import { useEarnPosition } from '../hooks';

export const PendingDepositWarning = () => {
  const { positionData } = useEarnPosition();
  if (!positionData || positionData.pendingDepositsInWsteth <= 0n) {
    return null;
  }

  return (
    <Alert.Root status="warning">
      <Alert.Title>
        Your deposit to Lido Earn strategy is pending. Withdrawal of those funds
        is not available yet.
      </Alert.Title>
    </Alert.Root>
  );
};
