import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Alert, Button, List } from '@chakra-ui/react';
import { FormatToken } from '@/shared/formatters';
import { tokenLabel } from '@/utils/token-label';
import { useRepayRebalanceAmount } from './hooks/use-repay-rebalance-amount';
import {
  RepayTokens,
  WithdrawalFormValues,
  WithdrawalTokens,
} from './withdrawal-form-context/types';

export type RepaymentAlertProps = {
  amount: bigint | null;
  repaymentToken: RepayTokens;
  token: WithdrawalTokens;
};
export const RepaymentAlert = ({
  amount,
  token,
  repaymentToken,
}: RepaymentAlertProps) => {
  const { maxEthForRepayableToken, rebalanceable, repayable } =
    useRepayRebalanceAmount(amount, repaymentToken);

  const { setValue } = useFormContext<WithdrawalFormValues>();
  if (!amount || !rebalanceable || rebalanceable <= 0n) {
    return null;
  }

  return (
    <Alert.Root status="info" colorPalette="orange">
      <Alert.Title>
        To withdraw{' '}
        <FormatToken
          amount={amount}
          fontWeight={700}
          trimEllipsis={true}
          token={token}
        />{' '}
        you need to repay all minted {tokenLabel(repaymentToken)} but your
        wallet balance is insufficient so:
        <List.Root paddingLeft={4}>
          <List.Item>
            <FormatToken
              amount={repayable}
              trimEllipsis={true}
              token={repaymentToken}
              fontWeight={700}
            />{' '}
            will be repaid from your wallet.
          </List.Item>
          <List.Item>
            <FormatToken
              amount={rebalanceable}
              trimEllipsis={true}
              token={repaymentToken}
              fontWeight={700}
            />{' '}
            will be rebalanced from your withdrawal request.
          </List.Item>
          <List.Item>
            The final number of assets will be reduced by the number of{' '}
            {tokenLabel(token)} corresponding to the remaining debt at the rate
            of {tokenLabel(repaymentToken)}
            {'<>'}
            {tokenLabel(token)} at the time of finalization of the application.
          </List.Item>
        </List.Root>
        {!!maxEthForRepayableToken && (
          <Button
            mt={2}
            size={'xs'}
            onClick={() => {
              setValue('amount', maxEthForRepayableToken || null);
            }}
          >
            Withdraw only repayable part
          </Button>
        )}
      </Alert.Title>
    </Alert.Root>
  );
};
