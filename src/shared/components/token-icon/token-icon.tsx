import React, { SVGProps } from 'react';
import { Token } from '@/types/token';
import ETH from 'assets/icons/ETH.svg?react';
import STETH from 'assets/icons/STETH.svg?react';
import WETH from 'assets/icons/WETH.svg?react';
import WSTETH from 'assets/icons/WSTETH.svg?react';

export const TokenIcon = ({
  token,
  size,
  ...rest
}: { token: Token; size: string } & SVGProps<SVGSVGElement>) => {
  switch (token) {
    case 'WETH':
      return <WETH width={size} height={size} {...rest} />;
    case 'WSTETH':
      return <WSTETH width={size} height={size} {...rest} />;
    case 'ETH':
      return <ETH width={size} height={size} {...rest} />;
    case 'STETH':
      return <STETH width={size} height={size} {...rest} />;
  }
};
