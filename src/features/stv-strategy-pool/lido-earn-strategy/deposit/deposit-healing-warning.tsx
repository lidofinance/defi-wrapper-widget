import { useWatch } from 'react-hook-form';
import { Alert } from '@chakra-ui/react';
import { FormatToken } from '@/shared/formatters';
import { useEarnPosition } from '../hooks';
import { DepositFormValues } from './deposit-form-context/types';

export const DepositHealingWarning = () => {
  const { positionData } = useEarnPosition();
  const amount = useWatch<DepositFormValues, 'amount'>({
    name: 'amount',
  });

  if (
    !positionData ||
    amount === null ||
    amount === 0n ||
    positionData.assetShortfallInEth < 1000n ||
    amount >= positionData.assetShortfallInEth
  ) {
    return null;
  }

  return (
    <Alert.Root status="warning">
      <Alert.Title>
        Your deposited value will not be utilized in the DeFi strategy as it
        will be used to restore collateral dis-balance of{' '}
        <FormatToken amount={positionData.assetShortfallInEth} token={'ETH'} />{' '}
        and heal your position.<b> No value will be lost.</b>
      </Alert.Title>
    </Alert.Root>
  );
};
