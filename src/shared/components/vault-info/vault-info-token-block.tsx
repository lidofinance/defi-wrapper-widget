import { useMemo } from 'react';
import { Box, SkeletonText, Text } from '@chakra-ui/react';
import { useEthUsd, useWstethUsd } from '@/modules/web3';
import { FormatPrice, FormatToken } from '@/shared/formatters';
import type { Token } from '@/types/token';

type VaultInfoEntryProps = {
  token: Token;
  amount: bigint;
};

export const VaultInfoTokenBlock = ({ token, amount }: VaultInfoEntryProps) => {
  const ethToUsd = useEthUsd(amount);
  const wstethToToUsd = useWstethUsd(amount);

  const usdData = useMemo(() => {
    return token === 'WSTETH' ? wstethToToUsd : ethToUsd;
  }, [ethToUsd, token, wstethToToUsd]);

  return (
    <>
      <Text fontSize="sm" fontWeight="semibold" color="fg">
        <FormatToken trimEllipsis amount={amount} token={token} />
      </Text>
      <Box fontSize="xs" fontWeight="normal" color="fg.subtle">
        <SkeletonText noOfLines={1} loading={usdData.isLoading}>
          <FormatPrice amount={usdData.usdAmount} />
        </SkeletonText>
      </Box>
    </>
  );
};
