import React from 'react';
import { Alert } from '@chakra-ui/react';
import { useDefiWrapper } from '@/modules/defi-wrapper';

type PausedAlertProps = {
  title?: string;
};

export const DepositPausedAlert = ({
  title = 'Deposit is currently unavailable',
}: PausedAlertProps) => {
  const { depositsPaused } = useDefiWrapper();
  if (!depositsPaused) {
    return null;
  }
  return <PausedAlert title={title} />;
};

export const DepositPausedBecauseOfMintingAlert = ({
  title = 'Deposit is currently unavailable',
}: PausedAlertProps) => {
  const { depositsPaused, mintingPaused } = useDefiWrapper();
  // if deposit is paused, we show dedicated deposit alert
  if (!mintingPaused || depositsPaused) {
    return null;
  }
  return <PausedAlert title={title} />;
};

export const WithdrawalPausedAlert = ({
  title = 'Withdrawal is currently unavailable',
}: PausedAlertProps) => {
  const { depositsPaused } = useDefiWrapper();
  if (!depositsPaused) {
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
