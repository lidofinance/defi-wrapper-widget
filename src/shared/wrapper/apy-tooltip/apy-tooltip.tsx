import React, { ReactNode } from 'react';
import { PositioningOptions } from '@zag-js/popper';
import { FiInfo } from 'react-icons/fi';
import { HStack, Skeleton, Text, VStack } from '@chakra-ui/react';
import { Tooltip } from '@/shared/components/tooltip';
import { FormatDate, FormatPercent } from '@/shared/formatters';

type APYTooltipProps = {
  isLoading?: boolean;
  lastUpdate?: Date;
  APY?: number;
  customContent?: ReactNode;
};

export const APYTooltip = React.forwardRef<HTMLDivElement, APYTooltipProps>(
  function APYTooltip({ isLoading, lastUpdate, APY, customContent }, ref) {
    const content = (
      // todo: dont hardcode width
      <VStack align="stretch" width="368px" background={'black'}>
        <HStack justify="space-between" alignItems="center">
          <Text fontSize="sm" fontWeight="bold">
            Total APY
          </Text>
          <Skeleton as={'span'} loading={isLoading}>
            <Text fontSize="sm" fontWeight="bold">
              <FormatPercent value={APY} decimals="percent" />
            </Text>
          </Skeleton>
        </HStack>
        {customContent}
        <Text fontSize="xs">
          APY is calculated after all fees deductions and indicates the user
          estimated yield.
        </Text>
        <Text fontSize="xs" color="whiteAlpha.600">
          Vault APY is calculated daily based on validation performance and
          connected strategy performance.
        </Text>

        <Text fontSize="xs" color="whiteAlpha.600">
          Last update{' '}
          <FormatDate isLoading={isLoading} date={lastUpdate} type="date" />
        </Text>
      </VStack>
    );

    return (
      <Tooltip
        content={content}
        ref={ref}
        positioning={
          {
            placement: 'bottom-start',
            shift: -40,
          } satisfies PositioningOptions
        }
      >
        <FiInfo size={16} color={'var(--chakra-colors-fg-subtle)'} />
      </Tooltip>
    );
  },
);

APYTooltip.displayName = 'APYTooltip';
