import React from 'react';
import { Flex, Spinner, Text, VStack } from '@chakra-ui/react';

type SplashScreenProps = {
  isLoading: boolean;
  children?: React.ReactNode;
  message?: string;
};

export const SplashScreen: React.FC<SplashScreenProps> = ({
  isLoading,
  children,
  message = 'Loading data...',
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <Flex
      position="absolute"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="rgba(255, 255, 255, 0.9)"
      zIndex="overlay"
      justify="center"
      align="center"
    >
      <VStack gap={4}>
        <Spinner size="xl" color="primary.500" />
        <Text fontSize="lg" fontWeight="medium">
          {message}
        </Text>
      </VStack>
    </Flex>
  );
};
