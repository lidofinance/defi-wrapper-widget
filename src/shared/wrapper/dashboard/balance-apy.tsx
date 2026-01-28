import React, { ReactNode } from 'react';
import { Flex, SkeletonText, Stat } from '@chakra-ui/react';
import { FormatPercent, FormatPrice, FormatToken } from '@/shared/formatters';
import { APYTooltip } from '@/shared/wrapper/apy-tooltip';
import { Token } from '@/types/token';

type DashboardBalanceApyProps = {
  isAPYLoading?: boolean;
  isBalanceLoading?: boolean;
  aprData?: { updatedAt: Date; apySma: number };
  token: Token;
  balance?: bigint;
  usdAmount?: number;
  isUSDAmountLoading?: boolean;
  customAPYTooltipContent?: ReactNode;
};

export const DashboardBalanceApy = ({
  isBalanceLoading,
  isAPYLoading,
  isUSDAmountLoading,
  aprData,
  token,
  balance,
  usdAmount,
  customAPYTooltipContent,
}: DashboardBalanceApyProps) => {
  return (
    <Flex
      justify="space-between"
      align="center"
      alignItems="flex-start"
      width="100%"
    >
      <Stat.Root width={'100%'}>
        <Stat.Label>My vault balance</Stat.Label>
        <Stat.ValueText>
          <FormatToken
            fontSize="3xl"
            isLoading={isBalanceLoading}
            amount={balance}
            token={token}
            approx={true}
            height={'10'}
            skeletonWidth={'6/12'}
            fallback="-"
          />
        </Stat.ValueText>

        <SkeletonText
          noOfLines={1}
          asChild
          width={'6/12'}
          loading={isUSDAmountLoading || isBalanceLoading}
        >
          <Stat.HelpText>
            <FormatPrice amount={usdAmount} />
          </Stat.HelpText>
        </SkeletonText>
      </Stat.Root>

      <Stat.Root width="90px" mr={'50px'} flexGrow={0}>
        <Stat.Label>
          APY{' '}
          <APYTooltip
            APY={aprData?.apySma}
            isLoading={isAPYLoading}
            lastUpdate={aprData?.updatedAt}
            customContent={customAPYTooltipContent}
          />
        </Stat.Label>
        <SkeletonText
          noOfLines={1}
          asChild
          height={'10'}
          width={'full'}
          loading={isAPYLoading}
        >
          <Stat.ValueText fontSize="3xl">
            <FormatPercent value={aprData?.apySma} decimals="percent" />
          </Stat.ValueText>
        </SkeletonText>
      </Stat.Root>
    </Flex>
  );
};
