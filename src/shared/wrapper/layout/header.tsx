import React from 'react';
import { Alert, Flex, Text } from '@chakra-ui/react';
import { USER_CONFIG, useUserConfig } from '@/config';
import { useDappStatus } from '@/modules/web3';
import { Connect } from '@/shared/wallet';
import { WalletModal } from '@/shared/wallet/wallet-modal';
import MainLogo from 'assets/icons/Horizontal_white.svg?react';

export const WidgetHeader: React.FC = () => {
  const { defaultChain } = useUserConfig();
  const { address, isSupportedChain, isWalletConnected, supportedChainLabels } =
    useDappStatus();

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
              This app doesn’t support your current network. Please switch to{' '}
              {supportedChainLabels[defaultChain]} in your wallet.
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
