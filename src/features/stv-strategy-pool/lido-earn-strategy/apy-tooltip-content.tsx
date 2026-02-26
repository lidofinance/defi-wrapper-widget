import { HStack, Skeleton, Text, VStack } from '@chakra-ui/react';
import { FormatPercent } from '@/shared/formatters';
import { useEarnStrategyApy } from './hooks';

export const ApyTooltipContent = () => {
  const { strategyApySma, vaultApy, isLoadingApr } = useEarnStrategyApy();

  return (
    <VStack gap={2} width={'full'} mb={2}>
      <HStack justify="space-between" alignItems="center" width={'full'}>
        <Text fontSize="sm" fontWeight="medium">
          Validation APR
        </Text>
        <Skeleton as={'span'} loading={isLoadingApr}>
          <Text fontSize="sm" fontWeight="normal">
            <FormatPercent value={vaultApy} decimals="percent" />
          </Text>
        </Skeleton>
      </HStack>
      <HStack justify="space-between" alignItems="center" width={'full'}>
        <Text fontSize="sm" fontWeight="medium">
          Strategy APY
        </Text>
        <Skeleton as={'span'} loading={isLoadingApr}>
          <Text fontSize="sm" fontWeight="normal">
            <FormatPercent value={strategyApySma} decimals="percent" />
          </Text>
        </Skeleton>
      </HStack>
    </VStack>
  );
};
