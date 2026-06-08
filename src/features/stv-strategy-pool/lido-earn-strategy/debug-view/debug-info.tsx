import type { ReactNode } from 'react';
import type { Address } from 'viem';
import { useChainId } from 'wagmi';
import { FiExternalLink } from 'react-icons/fi';
import { Box, HStack, Link, Span, Stack, Text } from '@chakra-ui/react';
import { trimAddress } from '@/shared/components/address/Address';
import { FormatToken } from '@/shared/formatters';
import type { Token } from '@/types/token';
import { getEtherscanAddressLink } from '@/utils/etherscan';

const RowLabel = ({ children }: { children: ReactNode }) => (
  <Text textStyle="xs" color="fg.muted" minW="48" flexShrink="0">
    {children}
  </Text>
);

export const DebugInfoSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <Box>
    <Text textStyle="sm" fontWeight="semibold" mb="2" color="fg.muted">
      {title}
    </Text>
    <Stack gap="1.5">{children}</Stack>
  </Box>
);

export const DebugAddressRow = ({
  label,
  address,
}: {
  label: string;
  address?: Address;
}) => {
  const chainId = useChainId();
  return (
    <HStack gap="3" textStyle="xs">
      <RowLabel>{label}</RowLabel>
      {address ? (
        <Link
          href={getEtherscanAddressLink(chainId, address)}
          target="_blank"
          rel="noopener noreferrer"
          display="inline-flex"
          alignItems="center"
          gap="1"
          fontFamily="mono"
          color="blue.500"
          _hover={{ color: 'blue.400' }}
        >
          {trimAddress(address, 6)}
          <FiExternalLink size={10} />
        </Link>
      ) : (
        <Span color="fg.subtle">—</Span>
      )}
    </HStack>
  );
};

export const DebugBooleanRow = ({
  label,
  value,
}: {
  label: string;
  value: boolean;
}) => (
  <HStack gap="3" textStyle="xs">
    <RowLabel>{label}</RowLabel>
    <HStack gap="1.5">
      <Box
        w="1.5"
        h="1.5"
        rounded="full"
        flexShrink="0"
        bg={value ? 'red.500' : 'green.500'}
      />
      <Span fontFamily="mono">{value ? 'true' : 'false'}</Span>
    </HStack>
  </HStack>
);

export const DebugRow = ({
  children,
  label,
}: React.PropsWithChildren<{ label: string }>) => (
  <HStack gap="3" textStyle="xs">
    <RowLabel>{label}</RowLabel>
    {children}
  </HStack>
);

export const DebugTokenAmountRow = ({
  label,
  amount,
  token,
}: {
  label: string;
  amount?: bigint | null;
  token?: Token;
}) => (
  <HStack gap="3" textStyle="xs">
    <RowLabel>{label}</RowLabel>
    <FormatToken
      amount={amount}
      token={token}
      textStyle="xs"
      fontFamily="mono"
    />
  </HStack>
);
