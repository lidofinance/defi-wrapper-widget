import { ReactNode } from 'react';
import { Box, Flex, Skeleton, SkeletonText, Text } from '@chakra-ui/react';
import { FormatPercent, FormatPrice, FormatToken } from '@/shared/formatters';
import { APYTooltip } from '@/shared/wrapper/apy-tooltip';

type RewardEstimationProps = {
  aprData?: { updatedAt: Date; aprSma: number };
  isLoadingAPR?: boolean;
  estimatedMonthlyRewardsETH?: bigint;
  estimatedMonthlyRewardsUSD?: number;
  estimatedYearlyRewardsETH?: bigint;
  estimatedYearlyRewardsUSD?: number;
  isLoadingRewards?: boolean;
  customAPYTooltipContent?: ReactNode;
};

export const RewardEstimation = ({
  aprData,
  isLoadingAPR,
  estimatedMonthlyRewardsETH,
  estimatedMonthlyRewardsUSD,
  estimatedYearlyRewardsETH,
  estimatedYearlyRewardsUSD,

  isLoadingRewards,
  customAPYTooltipContent,
}: RewardEstimationProps) => {
  return (
    <Flex direction="column" gap={2}>
      <Flex justify="space-between" align="center" gap={1}>
        <Flex direction="row" alignItems="center" gap={1}>
          <Text fontSize="md" fontWeight="bold" color="fg">
            APY
          </Text>
          <APYTooltip
            APY={aprData?.aprSma}
            isLoading={isLoadingAPR}
            lastUpdate={aprData?.updatedAt}
            customContent={customAPYTooltipContent}
          />
        </Flex>
        <Box fontSize="md" fontWeight="bold" color="colorPalette.solid">
          <SkeletonText loading={isLoadingAPR} noOfLines={1}>
            <FormatPercent decimals="percent" value={aprData?.aprSma} />
          </SkeletonText>
        </Box>
      </Flex>
      <Flex justify="space-between" align="flex-start" gap={1} color="fg">
        <Text flexBasis="50%" fontSize="sm">
          Yearly estimated rewards
        </Text>
        <Skeleton
          width="50%"
          as="span"
          loading={isLoadingRewards}
          fontSize="sm"
          textAlign="right"
        >
          <FormatToken amount={estimatedYearlyRewardsETH} token="ETH" approx />
          &nbsp;(
          <FormatPrice amount={estimatedYearlyRewardsUSD} />)
        </Skeleton>
      </Flex>
      <Flex justify="space-between" align="flex-start" gap={1} color="fg">
        <Text fontSize="sm">Monthly estimated rewards</Text>
        <Skeleton
          width="50%"
          as="span"
          loading={isLoadingRewards}
          fontSize="sm"
          textAlign="right"
        >
          <FormatToken amount={estimatedMonthlyRewardsETH} token="ETH" approx />
          &nbsp;(
          <FormatPrice amount={estimatedMonthlyRewardsUSD} />)
        </Skeleton>
      </Flex>
    </Flex>
  );
};
