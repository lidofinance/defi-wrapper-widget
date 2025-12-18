import { VStack } from '@chakra-ui/react';

export const FormContainer = ({ children }: React.PropsWithChildren) => {
  return (
    <VStack align="stretch" direction="column" gap={6}>
      {children}
    </VStack>
  );
};
