import React, { FC } from 'react';
import { Flex, FlexProps } from '@chakra-ui/react';
import { TokenIcon } from '@/shared/components/token-icon/token-icon';
import {
  FormatToken,
  FormatTokenProps,
} from '@/shared/formatters/format-token';
import { Token } from '@/types/token';

export const FormatTokenWithIcon: FC<
  { token: Token } & FormatTokenProps & FlexProps
> = ({
  amount,
  token,
  approx,
  skeletonWidth = 10,
  color,
  adaptiveDecimals,
  isLoading = false,
  trimEllipsis = true,
  ...rest
}) => {
  return (
    <Flex
      fontSize="xs"
      fontWeight="semibold"
      color="fg"
      pr={1}
      gap={1}
      alignItems={'center'}
      {...rest}
    >
      <FormatToken
        amount={amount}
        token={token}
        color={color}
        trimEllipsis={trimEllipsis}
        isLoading={isLoading}
        skeletonWidth={skeletonWidth}
        showSymbolOnFallback={true}
        fallback="N/A"
      />
      <TokenIcon token={token} size={'20px'} />
    </Flex>
  );
};
