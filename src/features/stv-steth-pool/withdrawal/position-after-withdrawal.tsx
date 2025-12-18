import React, { useEffect, useState } from 'react';
import {
  Accordion,
  Flex,
  Stack,
  StackProps,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useTransactionModal } from '@/shared/components/transaction-modal';
import { FormatTokenWithIcon } from '@/shared/formatters/format-token-with-icon';

type PositionAfterWithdrawalProps = {
  vaultBalance?: bigint;
  mintedSteth?: bigint;
  isLoading: boolean;
};

export const PositionAfterWithdrawal: React.FC<
  StackProps & PositionAfterWithdrawalProps
> = ({ vaultBalance, mintedSteth, isLoading, ...props }) => {
  const [value, setValue] = useState<string[]>([]);
  const { isOpen } = useTransactionModal();

  useEffect(() => {
    if (isOpen) {
      setValue([]);
    }
  }, [isOpen]);

  return (
    <Stack {...props}>
      <Accordion.Root
        multiple
        variant="plain"
        value={value}
        onValueChange={(e: { value: string[] }) => {
          setValue(e.value);
        }}
      >
        <Accordion.Item value={'details'}>
          <Accordion.ItemTrigger pt={0} cursor="pointer">
            <Text flex="1" fontSize="sm" fontWeight="bold">
              My position after withdrawal
            </Text>
            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <Accordion.ItemBody>
              <VStack align="stretch" divideY="1px" gap={0}>
                <Flex direction="column" mb={6} gap={2}>
                  <Flex
                    justify="space-between"
                    align="center"
                    gap={1}
                    color="fg"
                  >
                    <Text fontSize="sm" w={'50%'}>
                      Vault Balance
                    </Text>
                    <FormatTokenWithIcon
                      isLoading={isLoading}
                      alignSelf={'self-end'}
                      token={'ETH'}
                      amount={vaultBalance}
                    />
                  </Flex>

                  <Flex
                    justify="space-between"
                    align="center"
                    gap={1}
                    color="fg"
                  >
                    <Text fontSize="sm" w={'50%'}>
                      stETH minted
                    </Text>
                    <FormatTokenWithIcon
                      alignSelf={'self-end'}
                      token={'STETH'}
                      isLoading={isLoading}
                      amount={mintedSteth}
                    />
                  </Flex>
                </Flex>
              </VStack>
            </Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>
    </Stack>
  );
};
