import React from 'react';
import { Alert } from '@chakra-ui/react';
import { useDefiWrapper } from '@/modules/defi-wrapper';

type PausedAlertProps = {
  title?: string;
  isPaused?: boolean;
};

export const DepositPausedAlert = ({
  title = 'Deposit is currently unavailable',
  isPaused,
}: PausedAlertProps) => {
  const { depositsPaused } = useDefiWrapper();
  if (!(depositsPaused || isPaused)) {
    return null;
  }
  return <PausedAlert title={title} />;
};

export const DepositPausedBecauseOfMintingAlert = ({
  title = 'Deposit is currently unavailable',
  isPaused,
}: PausedAlertProps) => {
  const { depositsPaused, mintingPaused } = useDefiWrapper();
  if (!(mintingPaused || depositsPaused || isPaused)) {
    return null;
  }
  return <PausedAlert title={title} />;
};

export const WithdrawalPausedAlert = ({
  title = 'Withdrawal is currently unavailable',
  isPaused,
}: PausedAlertProps) => {
  const { withdrawalsPaused } = useDefiWrapper();
  if (!(withdrawalsPaused || isPaused)) {
    return null;
  }
  return <PausedAlert title={title} />;
};

const PausedAlert = ({ title }: PausedAlertProps) => {
  return (
    <Alert.Root status="error" mb={2}>
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{title}</Alert.Title>
      </Alert.Content>
    </Alert.Root>
  );
};
