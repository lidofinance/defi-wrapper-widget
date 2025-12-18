import React, { useCallback, useEffect, useState } from 'react';
import { useDisconnect } from 'reef-knot/core-react';
import { Box, Button, Center, Dialog, Text, VStack } from '@chakra-ui/react';
import { useWalletWhitelisted } from '@/modules/defi-wrapper';
import { useDappStatus } from '@/modules/web3';
import CrossIcon from 'assets/icons/cross.svg?react';

export const WhitelistedModal = () => {
  const { address } = useDappStatus();
  const { isWalletWhitelisted, isLoading } = useWalletWhitelisted();
  const [showPopup, setShowPopup] = useState(false);
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setShowPopup(!!address && !isLoading && !isWalletWhitelisted);
  }, [isWalletWhitelisted, address, isLoading]);

  const handleDisconnect = useCallback(() => {
    disconnect?.();
    setShowPopup(false);
  }, [disconnect]);

  return (
    <>
      <Dialog.Root
        open={showPopup}
        placement={'center'}
        size="sm"
        skipAnimationOnMount={true}
        closeOnEscape={false}
        closeOnInteractOutside={false}
        motionPreset={'none'}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content overflow={'hidden'} px={'5'}>
            <VStack
              flexDirection="column"
              textAlign="center"
              justifyContent="space-between"
              flex={1}
              display="flex"
              width={'full'}
            >
              <Center
                gap={0}
                mt={12}
                flexDirection="column"
                display="flex"
                width={'full'}
              >
                <Box mb={8}>
                  <CrossIcon
                    style={{
                      width: 'var(--chakra-sizes-16)',
                      height: 'var(--chakra-sizes-16)',
                    }}
                  ></CrossIcon>
                </Box>
                <Box width={'full'}>
                  <Text fontSize="lg" fontWeight="bold" color="fg" mb={2}>
                    Access denied
                  </Text>
                  <Text fontSize="sm" color="fg.subtle" mb={2}>
                    This address is not whitelisted in the vault. Try connecting
                    with another address
                  </Text>
                </Box>
              </Center>
              <Button
                bottom="0"
                size={'2xl'}
                width={'full'}
                variant={'outline'}
                colorPalette={'red'}
                onClick={handleDisconnect}
                justifySelf="flex-end"
                mt={4}
              >
                Disconnect
              </Button>
            </VStack>

            <Dialog.Footer></Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  );
};
