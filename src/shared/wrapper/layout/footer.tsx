import React from 'react';
import { Flex } from '@chakra-ui/react';
import PoweredByLido from 'assets/icons/powered-by.svg?react';

export const WidgetFooter: React.FC = () => {
  return (
    <Flex
      width="full"
      py={5}
      direction="row"
      alignItems="center"
      justify="center"
      gap={2}
    >
      <PoweredByLido />
    </Flex>
  );
};
