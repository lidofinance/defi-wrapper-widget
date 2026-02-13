import { useCallback, useEffect, useState } from 'react';
import type { Address as AddressViem } from 'viem';
import clsx from 'clsx';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { useConnectorInfo, useDisconnect } from 'reef-knot/core-react';
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  HStack,
} from '@chakra-ui/react';
import { USER_CONFIG } from '@/config';
import { useDappStatus } from '@/modules/web3';
import { Address } from '@/shared/components/address';
import { Identicon } from '@/shared/components/identicon';
import { Toaster } from '@/shared/components/toaster/toaster';
import { useCopyToClipboard } from '@/shared/hooks';
import { AddressBadge } from '@/shared/wallet/components/address-badge';
import { getEtherscanAddressLink } from '@/utils/etherscan';
import { openWindow } from '@/utils/open-window';
import styles from './wallet-modal.module.css';

export const WalletModal = ({ ...props }) => {
  const { address, walletChainId } = useDappStatus();
  const { connectorName } = useConnectorInfo();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  const handleDisconnect = useCallback(() => {
    disconnect?.();
  }, [disconnect]);

  const handleCopy = useCopyToClipboard(address ?? '');
  const handleEtherscan = useCallback(() => {
    // This component is wrapped by SupportL1Chains,
    // but not wrapped by SupportL2Chains (the chainId will never be a L2 network).
    // This is currently the fastest solution.
    const link = getEtherscanAddressLink(
      walletChainId ?? USER_CONFIG.defaultChain,
      address ?? '',
    );
    openWindow(link);
  }, [address, walletChainId]);

  useEffect(() => {
    // Close the submit-modal if a wallet was somehow disconnected while the submit-modal was open
    if (address == null || address.length === 0) {
      setOpen(false);
    }
  }, [address, setOpen]);

  return (
    <>
      <Toaster />
      <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
        <Dialog.Trigger asChild>
          <Button
            className={clsx(styles.walletButton)}
            variant="outline"
            size={'sm'}
            colorPalette={'gray'}
          >
            <span className={styles.walletButtonWrapper}>
              <AddressBadge address={address as AddressViem} />
            </span>
          </Button>
        </Dialog.Trigger>
        <Dialog.Backdrop />
        <Dialog.Positioner asChild overflow={'hidden'}>
          <Dialog.Content {...props}>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" variant="plain" />
            </Dialog.CloseTrigger>
            <Dialog.Header>
              <Dialog.Title>Account</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Flex
                direction={'column'}
                gap={2}
                backgroundColor={'#EFF2F6'}
                padding={5}
                borderRadius={'10px'}
                width={'100%'}
              >
                <Box className={styles.connected} color={'fg.subtle'}>
                  {connectorName && (
                    <div
                      className={styles.connector}
                      data-testid="providerName"
                    >
                      Connected with {connectorName}
                    </div>
                  )}

                  {disconnect && (
                    <Button
                      className={styles.disconnect}
                      size="xs"
                      variant="outline"
                      onClick={handleDisconnect}
                    >
                      Disconnect
                    </Button>
                  )}
                </Box>

                <Flex direction={'row'} gap={2} alignItems={'center'}>
                  <Identicon address={address ?? ''} />
                  <div className={styles.address}>
                    <Address
                      data-testid="connectedAddress"
                      address={address ?? ''}
                      symbols={6}
                    />
                  </div>
                </Flex>

                <HStack className={styles.actions} gap={3}>
                  <Button
                    data-testid="copyAddressBtn"
                    onClick={handleCopy}
                    size="xs"
                    variant="ghost"
                  >
                    <FiCopy /> Copy address
                  </Button>
                  <Button
                    data-testid="etherscanBtn"
                    onClick={handleEtherscan}
                    size="xs"
                    variant="ghost"
                  >
                    <FiExternalLink /> View on Etherscan
                  </Button>
                </HStack>
              </Flex>
            </Dialog.Body>
            <Dialog.Footer />
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  );
};
