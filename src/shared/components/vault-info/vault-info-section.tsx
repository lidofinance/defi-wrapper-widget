import { Box, VStack } from '@chakra-ui/react';

type VaultInfoSectionProps = React.PropsWithChildren<{
  label?: React.ReactNode;
}>;

export const VaultInfoSection = ({
  label,
  children,
}: VaultInfoSectionProps) => {
  return (
    <VStack align="stretch">
      <Box fontSize="sm" fontWeight="normal" color="fg">
        {label}
      </Box>
      <VStack>{children}</VStack>
    </VStack>
  );
};
