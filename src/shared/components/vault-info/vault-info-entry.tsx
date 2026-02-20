import { ReactNode } from 'react';
import { Box, HStack, Spacer, Text, VStack } from '@chakra-ui/react';
import { TokenIcon } from '@/shared/components/token-icon/token-icon';
import { VaultInfoTokenBlock } from '@/shared/components/vault-info/vault-info-token-block';
import { FormatToken } from '@/shared/formatters';
import type { Token } from '@/types/token';

type VaultInfoEntryProps = {
  token?: Token;
  amount: bigint;
  suffix?: ReactNode;
  customSymbol?: string;
  isLoading?: boolean;
  customDecimals?: number;
};

export const VaultInfoEntry = ({
  token,
  amount,
  suffix,
  customSymbol,
  customDecimals,
}: VaultInfoEntryProps) => {
  const useCustomSymbol = !token || customSymbol;

  const tokenIcon = useCustomSymbol ? (
    <Text
      fontSize="xs"
      fontWeight="semibold"
      color="fg.muted"
      className="w-[24px] h-[24px]"
    >
      {(customSymbol || '').substring(0, 2)}
    </Text>
  ) : (
    <TokenIcon token={token} size={'24px'} />
  );
  return (
    <HStack gap={2} alignItems="center" width="100%">
      <Box
        backgroundColor="white"
        borderRadius="full"
        p={0}
        height={'24px'}
        width={'24px'}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {tokenIcon}
      </Box>
      <VStack align="start" gap={0}>
        {useCustomSymbol ? (
          <Text fontSize="sm" fontWeight="semibold" color="fg">
            <FormatToken
              trimEllipsis
              amount={amount}
              customSymbol={customSymbol}
              tokenDecimals={customDecimals}
            />
          </Text>
        ) : (
          <VaultInfoTokenBlock token={token} amount={amount} />
        )}
      </VStack>
      <Spacer />
      {suffix}
    </HStack>
  );
};
