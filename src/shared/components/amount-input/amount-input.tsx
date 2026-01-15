import React, {
  ChangeEvent,
  CSSProperties,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { formatEther, maxUint256, parseEther } from 'viem';
import { Field, Flex, Input, InputProps } from '@chakra-ui/react';
import { FormatPrice } from '@/shared/formatters';

const parseEtherSafe = (value: string) => {
  try {
    return parseEther(value);
  } catch {
    return null;
  }
};

type TokenAmountInputProps = InputProps & {
  disabled?: boolean;
  onChange?: (value: bigint | null) => void;
  value?: bigint | null;
  amountUsd?: number;
  error?: React.ReactNode;
};

export const AmountInput: React.FC<TokenAmountInputProps> = forwardRef<
  HTMLInputElement,
  TokenAmountInputProps
>(({ value, onChange, amountUsd, error, children, ...rest }, ref) => {
  const isError = Boolean(error);
  const defaultValue = useMemo(
    () => (value ? formatEther(value) : ''),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const lastInputValue = useRef(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => inputRef.current!, []);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      // will accumulate changes without committing to dom
      let currentValue = e.currentTarget.value;
      const immutableValue = e.currentTarget.value;
      const caretPosition = e.currentTarget.selectionStart ?? 0;

      currentValue = currentValue.trim();

      // Support for devices where inputMode="decimal" showing keyboard with comma as decimal delimiter
      if (currentValue.includes(',')) {
        currentValue = currentValue.replaceAll(',', '.');
      }

      // delete negative sign
      if (currentValue.includes('-')) {
        currentValue = currentValue.replaceAll('-', '');
      }

      // Prepend zero when user types just a dot symbol for "0."
      if (currentValue === '.') {
        currentValue = '0.';
      }

      if (currentValue === '') {
        onChange?.(null);
      } else {
        const value = parseEtherSafe(currentValue);
        // The check !value is not suitable because !value returns true for 0n.
        if (value == null) {
          // invalid value, so we rollback to last valid value
          const rollbackCaretPosition =
            caretPosition -
            Math.min(
              e.currentTarget.value.length - lastInputValue.current.length,
            );
          // rollback value (caret moves to end)
          e.currentTarget.value = lastInputValue.current;
          // rollback caret
          e.currentTarget.setSelectionRange(
            rollbackCaretPosition,
            rollbackCaretPosition,
          );
          return;
        }

        const cappedValue = value > maxUint256 ? maxUint256 : value;
        if (value > maxUint256) {
          currentValue = formatEther(maxUint256);
        }
        onChange?.(cappedValue);
      }

      // commit change to dom
      e.currentTarget.value = currentValue;
      // if there is a diff due to soft change, adjust caret to remain in same place
      if (currentValue != immutableValue) {
        const rollbackCaretPosition =
          caretPosition - Math.min(immutableValue.length - currentValue.length);
        e.currentTarget.setSelectionRange(
          rollbackCaretPosition,
          rollbackCaretPosition,
        );
      }
      lastInputValue.current = currentValue;
    },
    [onChange],
  );

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    // The check !value is not suitable because !value returns true for 0n.
    if (value == null) {
      input.value = '';
    } else {
      const parsedValue = parseEtherSafe(input.value);
      // only change string state if casted values differ
      // this allows user to enter 0.100 without immediate change to 0.1
      if (parsedValue !== value) {
        input.value = formatEther(value);
        // prevents rollback to incorrect value in onChange
        lastInputValue.current = input.value;
      }
    }
  }, [value]);

  const showUsdAmount = value !== null;

  return (
    <Flex direction="column" position="relative">
      <Flex justify="space-between" align="center" gap={1}>
        {children}
        <Field.Root invalid={isError}>
          <Input
            ref={inputRef}
            {...rest}
            size="2xl"
            onChange={handleChange}
            pb={showUsdAmount ? 5 : 0}
            variant={'outline'}
            lineHeight="normal"
            type="text"
            inputMode="decimal"
          />
          {value}

          <Field.Label
            htmlFor="city"
            position="absolute"
            bottom="2"
            right="5"
            m="0"
            fontSize="xs"
            color="gray.400"
            pointerEvents="none"
            aria-hidden="true"
            css={
              {
                opacity: showUsdAmount ? 1 : 0,
                transition: 'opacity 0.12s ease',
              } as CSSProperties
            }
          >
            <FormatPrice amount={amountUsd} />
          </Field.Label>
        </Field.Root>
      </Flex>

      {isError && (
        <Field.Root invalid>
          <Field.ErrorText position={'absolute'} right="0" top={1}>
            {error}
          </Field.ErrorText>
        </Field.Root>
      )}
    </Flex>
  );
});
