import { useWatch } from 'react-hook-form';
import { useDappStatus, useEthUsd } from '@/modules/web3';

import { AmountInput } from '@/shared/hook-form/controls';
import { useWithdrawalFormContext } from './withdrawal-form-context';
import { WithdrawalFormValues } from './withdrawal-form-context/types';

export const WithdrawalInputGroup = () => {
  const amount = useWatch<WithdrawalFormValues, 'amount'>({
    name: 'amount',
  });
  const usdQuery = useEthUsd(amount);
  const { isWalletConnected } = useDappStatus();

  const { maxAvailable } = useWithdrawalFormContext();

  return (
    <AmountInput
      groupLabel="Withdraw"
      maxAmount={maxAvailable}
      renderMaxAmount={isWalletConnected}
      amountUsd={usdQuery.usdAmount}
      token={'ETH'}
    />
  );
};
