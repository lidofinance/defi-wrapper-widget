import { useEffect } from 'react';
import { useController, useFormContext, useWatch } from 'react-hook-form';
import { Flex, FlexProps, Text } from '@chakra-ui/react';
import {
  AmountInput,
  OptionItem,
  TokenSelect,
} from '@/shared/components/amount-input';
import { AvailableMax } from '@/shared/components/available-max';
import { Token } from '@/types/token';
import { tokenLabel as getTokenLabel } from '@/utils/token-label';

type TokenAmountInputProps = FlexProps & {
  amountFieldName?: string;
  tokenFieldName?: string;
  amountUsd?: number;
  renderMaxAmount?: boolean;
  groupLabel?: React.ReactNode;
  tokenOptions: OptionItem[];
  maxAmount?: bigint;
};

export const TokenAmountInput = ({
  amountFieldName = 'amount',
  tokenFieldName = 'token',
  amountUsd,
  renderMaxAmount,
  groupLabel,
  tokenOptions,
  maxAmount,
  ...rest
}: TokenAmountInputProps) => {
  const tokenValue = useWatch({ name: tokenFieldName }) as Token;
  const tokenLabel = getTokenLabel(tokenValue);
  const { setValue, trigger } = useFormContext();
  const {
    field,
    fieldState: { error },
  } = useController({ name: amountFieldName });

  const { field: tokenField } = useController({ name: tokenFieldName });

  // token change resets amount input
  useEffect(() => {
    () => setValue(amountFieldName, 0n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenValue]);

  const onMaxClick = () => {
    if (maxAmount) {
      setValue(amountFieldName, maxAmount);
      trigger(amountFieldName);
    }
  };

  return (
    <Flex direction="column" gap={2} {...rest}>
      {renderMaxAmount && (
        <Flex justify="space-between" align="center">
          <Text
            fontSize="lg"
            fontWeight="bold"
            color="fg"
            display="inline-block"
          >
            {groupLabel}
          </Text>
          <AvailableMax
            disabled={field.disabled}
            token={tokenValue}
            availableAmount={maxAmount}
            onMaxClick={onMaxClick}
          />
        </Flex>
      )}
      <AmountInput
        {...field}
        placeholder={`${tokenLabel} amount`}
        error={error?.message}
        amountUsd={amountUsd}
      >
        <TokenSelect {...tokenField} options={tokenOptions} />
      </AmountInput>
    </Flex>
  );
};
