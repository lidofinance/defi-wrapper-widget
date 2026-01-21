import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Flex } from '@chakra-ui/react';
import { MintTokenSwitch } from '@/shared/components/mint-token-switch';
import { FormatTokenWithIcon } from '@/shared/formatters/format-token-with-icon';
import { useMinWithdrawalError } from './hooks/use-min-withdrawal-error';
import { useRepayRebalanceAmount } from './hooks/use-repay-rebalance-amount';
import { useRepayRebalanceRatio } from './hooks/use-repay-rebalance-ratio';
import { RepaymentAlert } from './repayment-alert';
import type {
  RepayTokens,
  WithdrawalFormValues,
} from './withdrawal-form-context/types';

export const WillRepay = () => {
  const amount = useWatch<WithdrawalFormValues, 'amount'>({
    name: 'amount',
  });

  const repayToken = useWatch<WithdrawalFormValues, 'repayToken'>({
    name: 'repayToken',
  });

  const { setValue } = useFormContext<WithdrawalFormValues>();

  const onTokenChange = (newToken: RepayTokens) => {
    setValue('repayToken', newToken);
  };

  // allowing UI to render like user inputed 0 if input is empty
  const amountToCalcFor = amount || 0n;
  const { isLoading } = useRepayRebalanceRatio(amountToCalcFor, repayToken);
  const { repayable } = useRepayRebalanceAmount(amountToCalcFor, repayToken);

  useMinWithdrawalError(amount, repayToken);

  return (
    <>
      <Flex justify="space-between" align="center" gap={1} color="fg">
        <MintTokenSwitch
          label={'Repay'}
          token={repayToken}
          onTokenChange={onTokenChange}
        />
        <FormatTokenWithIcon
          isLoading={amount != null && isLoading}
          fontWeight="semibold"
          color="fg"
          fallback="-"
          token={repayToken}
          amount={repayable}
        />
      </Flex>

      <RepaymentAlert
        repaymentToken={repayToken}
        token={'ETH'}
        amount={amount}
      />
    </>
  );
};
