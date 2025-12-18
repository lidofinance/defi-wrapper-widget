import React from 'react';
import { Flex, Text } from '@chakra-ui/react';
import { Alert } from '@chakra-ui/react';
import { USER_CONFIG } from '@/config';
import { useDappStatus } from '@/modules/web3';
import { Connect } from '@/shared/wallet';
import { WalletModal } from '@/shared/wallet/wallet-modal';
import MainLogo from 'assets/icons/header_logo.svg?react';

export const WidgetHeader: React.FC = () => {
  const { address, isSupportedChain, isWalletConnected } = useDappStatus();

  const title = USER_CONFIG.widgetTitle;
  const showChainAlert = isWalletConnected && !isSupportedChain;
  return (
    <>
      <Flex alignItems="center" justify="space-between" width="full" mb={2}>
        <MainLogo width="94px" height="23px" />
        {address ? <WalletModal /> : <Connect size={'sm'} />}
      </Flex>

      {showChainAlert && (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Unsupported network</Alert.Title>
            <Alert.Description>
              This app doesn’t support your current network. Please switch to
              Ethereum in your wallet.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      {title ? (
        <Text fontSize={'xl'} fontWeight={'semibold'} mt={4}>
          {title}
        </Text>
      ) : (
        <></>
      )}
    </>
  );
};
