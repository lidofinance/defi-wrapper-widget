import { useController, useFormContext } from 'react-hook-form';
import { Flex, FlexProps, Text } from '@chakra-ui/react';
import { AmountInput as AmountInputControlled } from '@/shared/components/amount-input';
import { AvailableMax } from '@/shared/components/available-max';
import { Token } from '@/types/token';

type AmountInputProps = FlexProps & {
  amountFieldName?: string;
  amountUsd?: number;
  renderMaxAmount?: boolean;
  token: Token;
  groupLabel?: React.ReactNode;
  maxAmount?: bigint;
  dedication?: string;
};

export const AmountInput = ({
  amountFieldName = 'amount',
  amountUsd,
  token,
  renderMaxAmount,
  groupLabel,
  maxAmount,
  dedication,
  ...rest
}: AmountInputProps) => {
  const { setValue, trigger } = useFormContext();
  const {
    field,
    fieldState: { error },
  } = useController({ name: amountFieldName });

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
            token={token}
            availableAmount={maxAmount}
            onMaxClick={onMaxClick}
            dedication={dedication}
          />
        </Flex>
      )}
      <AmountInputControlled
        {...field}
        placeholder={`${token} amount`}
        error={error?.message}
        amountUsd={amountUsd}
      />
    </Flex>
  );
};
