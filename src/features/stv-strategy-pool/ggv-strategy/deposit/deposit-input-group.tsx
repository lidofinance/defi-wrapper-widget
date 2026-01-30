import { useWatch } from 'react-hook-form';
import { useDappStatus, useEthUsd } from '@/modules/web3';
import { TOKEN_OPTIONS } from '@/shared/components/amount-input';

import { TokenAmountInput } from '@/shared/hook-form/controls/token-amount-input';
import { useDepositFormContext } from './deposit-form-context';
import { DepositFormValues } from './deposit-form-context/types';

const DEPOSIT_OPTIONS = [TOKEN_OPTIONS.ETH, TOKEN_OPTIONS.WETH];

export const DepositInputGroup = () => {
  const amount = useWatch<DepositFormValues, 'amount'>({
    name: 'amount',
  });
  const usdQuery = useEthUsd(amount);
  const { isWalletConnected } = useDappStatus();
  const { maxAvailable } = useDepositFormContext();

  return (
    <TokenAmountInput
      groupLabel="Deposit"
      maxAmount={maxAvailable}
      renderMaxAmount={isWalletConnected}
      amountUsd={usdQuery.usdAmount}
      tokenOptions={DEPOSIT_OPTIONS}
      dedication={'for deposit'}
    />
  );
};
