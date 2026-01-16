import React from 'react';
import { PositioningOptions } from '@zag-js/popper';
import { FiInfo } from 'react-icons/fi';
import { Circle, HStack, Progress, Text, VStack } from '@chakra-ui/react';
import { Tooltip } from '@/shared/components/tooltip/tooltip';
import { FormatPercent } from '@/shared/formatters';
import { MintableTokens } from '../deposit/deposit-form-context/types';

type ReserveRatioTooltipProps = {
  reserveRatioPercent?: number;
  tokenToMint: MintableTokens;
};

export const ReserveRatioTooltip = React.forwardRef<
  HTMLDivElement,
  ReserveRatioTooltipProps
>(function ReserveRatioTooltip(
  { reserveRatioPercent, tokenToMint = 'stETH' },
  ref,
) {
  const content = (
    <VStack align="stretch" width="350px" maxWidth={'100vw'}>
      <Text fontSize="sm" fontWeight="bold">
        Reserve ratio{' '}
        <FormatPercent decimals="percent" value={reserveRatioPercent} />
      </Text>
      <Text fontSize="xs" color="whiteAlpha.600">
        The Reserve Ratio shows how your deposit is split: one part stays in the
        vault as reserve, while the other is used to mint {tokenToMint}. Each
        time {tokenToMint} is minted, the corresponding share of ETH is locked
        in reserve.
      </Text>
      <Text fontSize="xs" color="whiteAlpha.600">
        You automatically repay the {tokenToMint} portion on withdrawal
        according to the Reserve Ratio.
      </Text>
      <Progress.Root defaultValue={reserveRatioPercent || 0} size={'sm'} mt={3}>
        <HStack gap="5">
          <Progress.Track flex="1">
            <Progress.Range />
          </Progress.Track>
        </HStack>
        <HStack gap={4} mt="2">
          <Progress.Label mb="2" fontSize={'xs'}>
            <Circle size={'3'} backgroundColor={'bg.progress'}></Circle>
            Liquid{' '}
            <Text fontWeight={'bold'}>
              <FormatPercent decimals={'percent'} value={reserveRatioPercent} />
            </Text>
          </Progress.Label>

          <Progress.Label mb="2" fontSize={'xs'}>
            <Circle size={'3'} backgroundColor={'colorPalette.600'}></Circle>
            Illiquid{' '}
            <Text fontWeight={'bold'}>
              <FormatPercent
                decimals={'percent'}
                value={100 - (reserveRatioPercent || 0)}
              />
            </Text>
          </Progress.Label>
        </HStack>
      </Progress.Root>
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
      <FiInfo
        style={{ display: 'inline', top: '-2px', position: 'relative' }}
        size={16}
        color={'var(--chakra-colors-fg-subtle)'}
      />
    </Tooltip>
  );
});

ReserveRatioTooltip.displayName = 'ReserveRatioTooltip';
