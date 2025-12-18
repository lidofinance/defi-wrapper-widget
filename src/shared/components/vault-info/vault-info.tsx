import { VStack } from '@chakra-ui/react';

export const VaultInfo = ({ children }: React.PropsWithChildren) => {
  return (
    <VStack
      backgroundColor="bg.muted"
      align="stretch"
      gap={6}
      m={0}
      borderRadius="10px"
      p={4}
      width={'100%'}
    >
      {children}
    </VStack>
  );
};
