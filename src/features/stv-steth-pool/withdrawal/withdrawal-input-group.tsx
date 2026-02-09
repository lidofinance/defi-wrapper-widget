import { useWatch } from 'react-hook-form';
import { VStack } from '@chakra-ui/react';
import { useDappStatus, useEthUsd } from '@/modules/web3';

import { AmountInput, SubmitButton } from '@/shared/hook-form/controls';
import { WaitingTime } from '@/shared/wrapper/withdrawal/waiting-time';
import { usePositionAfterWithdrawal } from './hooks/use-position-after-withdrawal';

import { PositionAfterWithdrawal } from './position-after-withdrawal';
import { WillRepay } from './will-repay';
import { useWithdrawalFormContext } from './withdrawal-form-context';
import { WithdrawalFormValues } from './withdrawal-form-context/types';

export const WithdrawalInputGroup = () => {
  const amount = useWatch<WithdrawalFormValues, 'amount'>({
    name: 'amount',
  });

  const usdQuery = useEthUsd(amount);
  const { isWalletConnected } = useDappStatus();

  const { maxAvailable } = useWithdrawalFormContext();

  const {
    data: positionAfterWithdrawal,
    isLoading: isPositionAfterWithdrawalLoading,
  } = usePositionAfterWithdrawal(amount || 0n);

  return (
    <VStack width={'full'} align="stretch" gap={3}>
      <AmountInput
        groupLabel="Withdraw"
        maxAmount={maxAvailable}
        renderMaxAmount={isWalletConnected}
        amountUsd={usdQuery.usdAmount}
        token={'ETH'}
        dedication={'for withdrawal'}
        mb={3}
      />
      <WillRepay />
      <WaitingTime waitingTime="5 days" />
      {isWalletConnected && (
        <PositionAfterWithdrawal
          isLoading={isPositionAfterWithdrawalLoading}
          vaultBalance={positionAfterWithdrawal?.vaultBalanceETHAfter}
          mintedSteth={positionAfterWithdrawal?.stethMintedAfter}
        />
      )}
      <SubmitButton>Withdraw</SubmitButton>
    </VStack>
  );
};
