import React from 'react';
import { Flex, Text } from '@chakra-ui/react';
import { USER_CONFIG } from '@/config';
import { useDappStatus } from '@/modules/web3';
import { Connect } from '@/shared/wallet';
import { WalletModal } from '@/shared/wallet/wallet-modal';
import MainLogo from 'assets/icons/header_logo.svg?react';

export const WidgetHeader: React.FC = () => {
  const { address } = useDappStatus();
  const title = USER_CONFIG.widgetTitle;
  return (
    <>
      <Flex alignItems="center" justify="space-between" width="full" mb={2}>
        <MainLogo width="94px" height="23px" />
        {address ? <WalletModal /> : <Connect size={'sm'} />}
      </Flex>
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
