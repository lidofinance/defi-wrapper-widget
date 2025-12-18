import React from 'react';
import { HStack, Skeleton, Text, VStack } from '@chakra-ui/react';
import { useVaultApr } from '@/modules/vaults';
import { FormatPercent } from '@/shared/formatters';
import { useGGVStrategyApy } from './hooks/use-ggv-strategy-apy';

export const ApyTooltipContent = () => {
  const { data: vaultAPRData, isLoading } = useVaultApr();
  const { strategyApySma } = useGGVStrategyApy();

  return (
    <VStack gap={2} width={'full'} mb={2}>
      <HStack justify="space-between" alignItems="center" width={'full'}>
        <Text fontSize="sm" fontWeight="medium">
          Validation APR
        </Text>
        <Skeleton as={'span'} loading={isLoading}>
          <Text fontSize="sm" fontWeight="normal">
            <FormatPercent value={vaultAPRData?.aprSma} decimals="percent" />
          </Text>
        </Skeleton>
      </HStack>
      <HStack justify="space-between" alignItems="center" width={'full'}>
        <Text fontSize="sm" fontWeight="medium">
          Strategy APY
        </Text>
        <Skeleton as={'span'} loading={isLoading}>
          <Text fontSize="sm" fontWeight="normal">
            <FormatPercent value={strategyApySma} decimals="percent" />
          </Text>
        </Skeleton>
      </HStack>
    </VStack>
  );
};
