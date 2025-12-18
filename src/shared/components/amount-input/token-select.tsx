import React, { forwardRef, ReactElement, useMemo } from 'react';
import {
  createListCollection,
  HStack,
  Select,
  useSelectContext,
} from '@chakra-ui/react';
import type { Token } from '@/types/token';
import { TokenIcon } from '../token-icon/token-icon';

export type OptionItem = {
  label: string;
  value: Token;
  icon?: ReactElement;
};

export const TOKEN_OPTIONS: Record<Token, OptionItem> = {
  ETH: {
    label: 'ETH',
    value: 'ETH',
    icon: <TokenIcon token={'ETH'} size={'24px'} />,
  },
  WETH: {
    label: 'WETH',
    value: 'WETH',
    icon: <TokenIcon token={'WETH'} size={'24px'} />,
  },
  STETH: {
    label: 'STETH',
    value: 'STETH',
    icon: <TokenIcon token={'STETH'} size={'24px'} />,
  },
  WSTETH: {
    label: 'WSTETH',
    value: 'WSTETH',
    icon: <TokenIcon token={'WSTETH'} size={'24px'} />,
  },
};

const SelectValue = () => {
  const select = useSelectContext();
  const items = select.selectedItems as OptionItem[];
  if (!items[0]) {
    return null;
  }
  const { label, icon } = items[0];
  return (
    <Select.ValueText placeholder="Select token">
      <HStack>
        {icon}
        {label}
      </HStack>
    </Select.ValueText>
  );
};

type TokenSelectProps = {
  value: string;
  onChange?: (value: string) => void;
  options: OptionItem[];
};

export const TokenSelect = forwardRef<HTMLSelectElement, TokenSelectProps>(
  ({ value, onChange, options }, ref) => {
    const handleTokenChange = (details: any) => {
      if (details.value && details.value.length > 0) {
        onChange?.(details.value[0] as any);
      }
    };

    const collection = useMemo(() => {
      return createListCollection({
        items: options,
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
      });
    }, [options]);

    return (
      <Select.Root
        collection={collection}
        size="lg"
        width="240px"
        value={[value]}
        onValueChange={handleTokenChange}
        positioning={{ sameWidth: true }}
      >
        <Select.HiddenSelect ref={ref} />
        <Select.Control>
          <Select.Trigger>
            <SelectValue />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Select.Positioner>
          <Select.Content>
            {options.map((item) => (
              <Select.Item
                item={item}
                key={item.value}
                justifyContent="flex-start"
              >
                {item.icon}
                {item.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Select.Root>
    );
  },
);
