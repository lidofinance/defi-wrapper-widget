import { Flex, Text, VStack } from '@chakra-ui/react';
import type { StackProps } from '@chakra-ui/react';

type WaitingTimeProps = StackProps & {
  waitingTime: string;
};

export const WaitingTime = ({ waitingTime, ...rest }: WaitingTimeProps) => {
  return (
    <VStack align="stretch" divideY="1px" gap={0} {...rest}>
      <Flex direction="column" gap={2}>
        <Flex justify="space-between" align="center" gap={1} color="fg">
          <Text fontSize="sm" w={'50%'}>
            Waiting time
          </Text>
          <Text fontSize="sm" alignSelf={'self-end'}>
            ~{waitingTime}
          </Text>
        </Flex>
      </Flex>
    </VStack>
  );
};
