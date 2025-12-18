import { useWatch } from 'react-hook-form';
import { Alert, List, Flex, Text } from '@chakra-ui/react';
import { TokenIcon } from '@/shared/components/token-icon/token-icon';
import { FormatToken } from '@/shared/formatters';
import { useRepayRebalanceRatio } from './use-repay-rebalance-ratio';
import type { WithdrawalFormValues } from './withdrawal-form-context/types';

export const WillRepay = () => {
  const amount = useWatch<WithdrawalFormValues, 'amount'>({
    name: 'amount',
  });
  const { data, isPending } = useRepayRebalanceRatio(amount);

  return (
    <>
      <Flex justify="space-between" align="center" gap={1} color="fg">
        <Text fontSize="sm" w={'50%'}>
          You will repay
        </Text>
        <Flex>
          <Text fontSize="xs" fontWeight="semibold" color="fg">
            <FormatToken
              amount={data?.repayableSteth}
              token={'STETH'}
              trimEllipsis={true}
              isLoading={amount != null && isPending}
              showSymbolOnFallback={true}
              fallback="N/A"
            />
          </Text>
          <TokenIcon token={'STETH'} size={'20px'} />
        </Flex>
      </Flex>
      {data && data.rebalanceableStethShares > 0n && (
        <Alert.Root status="info" colorPalette="orange">
          <Alert.Title>
            To withdraw{' '}
            <FormatToken
              amount={amount}
              fontWeight={700}
              trimEllipsis={true}
              token="ETH"
            />{' '}
            you need to repay all minted stETH but your wallet balance is
            insufficient so:
            <List.Root paddingLeft={4}>
              <List.Item>
                <FormatToken
                  amount={data.repayableSteth}
                  trimEllipsis={true}
                  token="STETH"
                  fontWeight={700}
                />{' '}
                will be repaid from your wallet.
              </List.Item>
              <List.Item>
                <FormatToken
                  amount={data.rebalanceableSteth}
                  trimEllipsis={true}
                  token="STETH"
                  fontWeight={700}
                />{' '}
                will be rebalanced from your withdrawal request.
              </List.Item>
              <List.Item>
                The final amount of withdrawn assets will be decreased by{' '}
                <FormatToken
                  fontWeight={700}
                  amount={data.rebalanceableSteth}
                  trimEllipsis={true}
                  token="ETH"
                />
              </List.Item>
            </List.Root>
          </Alert.Title>
        </Alert.Root>
      )}
    </>
  );
};
