import { FC } from 'react';
import { Skeleton, Span } from '@chakra-ui/react';
import type { HTMLChakraProps } from '@chakra-ui/react/styled-system';
import { DATA_UNAVAILABLE } from '@/consts/text';
import { Tooltip } from '@/shared/components/tooltip/tooltip';
import { Token } from '@/types/token';
import { FormatBalanceArgs, useFormattedBalance } from '@/utils/formatBalance';
import { tokenLabel } from '@/utils/token-label';

const ETH_DECIMALS = 18;

export type FormatTokenProps = HTMLChakraProps<'span'> &
  FormatBalanceArgs & {
    token?: Token;
    amount?: bigint | null;
    approx?: boolean;
    showAmountTip?: boolean;
    showSymbolOnFallback?: boolean;
    fallback?: string;
    isLoading?: boolean;
    skeletonWidth?: string | number;
    customSymbol?: string;
    tokenDecimals?: number;
  };

export const FormatToken: FC<FormatTokenProps> = ({
  amount,
  approx,
  token,
  maxDecimalDigits = 4,
  maxTotalLength = 15,
  tokenDecimals = ETH_DECIMALS,
  showAmountTip = true,
  showSymbolOnFallback = false,
  trimEllipsis,
  skeletonWidth,
  fallback = DATA_UNAVAILABLE,
  adaptiveDecimals,
  isLoading,
  customSymbol,
  ...rest
}) => {
  const symbol = !token || customSymbol ? customSymbol : tokenLabel(token);

  const { actual, isTrimmed, trimmed, isTrimmedRepresentZero } =
    useFormattedBalance(amount != null ? amount : undefined, {
      maxDecimalDigits,
      maxTotalLength,
      trimEllipsis,
      adaptiveDecimals,
      tokenDecimals,
    });

  if (isLoading)
    return (
      <Skeleton
        height={'1em'}
        {...rest}
        width={skeletonWidth || rest.width}
        as={'span'}
      />
    );

  if (amount == null)
    return (
      <Span {...rest}>
        {fallback}
        {showSymbolOnFallback && symbol ? ` ${symbol}` : ''}
      </Span>
    );

  const showTooltip = showAmountTip && isTrimmed;

  // we show prefix for non zero amount and if we need to show Tooltip Amount
  // overridden by explicitly set approx
  const prefix =
    amount && isTrimmedRepresentZero && amount !== 0n && approx ? '≈ ' : '';

  const body = (
    <Span {...rest}>
      {prefix}
      {trimmed}&nbsp;{symbol}
    </Span>
  );

  if (showTooltip) {
    return (
      <Tooltip
        positioning={{ placement: 'top-end' }}
        content={
          <Span>
            {actual}&nbsp;{symbol}
          </Span>
        }
      >
        {body}
      </Tooltip>
    );
  }

  return body;
};
