import { Flex, VStack } from '@chakra-ui/react';

export const DashboardContainer: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <VStack align="stretch" gap={6}>
      <Flex direction="column" gap={6}>
        {children}
      </Flex>
    </VStack>
  );
};
