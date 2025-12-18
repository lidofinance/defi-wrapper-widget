import React, { useEffect } from 'react';
import type { Hash } from 'viem';
import {
  Box,
  Button,
  Center,
  Presence,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import CheckIcon from 'assets/icons/check.svg?react';
import CrossIcon from 'assets/icons/cross.svg?react';

import { TxLinkAA, TxLinkEtherscan } from '../tx-link-etherscan';

import { useTransactionModal } from './transaction-modal';
import type { TransactionModalState } from './types';

const getMainContent = (state: TransactionModalState) => {
  return (
    <Box width={'full'}>
      <Text fontSize="lg" fontWeight="bold" color="fg" mb={2}>
        {state.details.actionTitleText}
      </Text>
      <Text fontSize="sm" color="fg.subtle" mb={2}>
        {state.details.actionDescriptionText}
      </Text>
    </Box>
  );
};
const showEtherscanLink = (state: TransactionModalState) => {
  if (
    state.details.transactionId &&
    (state.stage === 'awaiting' || state.stage === 'success')
  ) {
    if (state.details.isAA) {
      return <TxLinkAA callId={state.details.transactionId} />;
    }
    return <TxLinkEtherscan txHash={state.details.transactionId as Hash} />;
  }
};

const showBackToDashboardButton = (
  state: TransactionModalState,
  onBackToDashboard: () => void,
  backToSameTab: () => void,
) => {
  if (state.stage === 'success' || state.stage === 'error') {
    const text = state.stage === 'error' ? 'Try again' : 'Go to dashboard';
    const onClickAction =
      state.stage === 'error' ? backToSameTab : onBackToDashboard;
    return (
      <Button
        bottom="0"
        size={'2xl'}
        width={'full'}
        onClick={onClickAction}
        justifySelf="flex-end"
        mt={4}
      >
        {text}
      </Button>
    );
  }
  return null;
};

const showDepositMoreButton = (
  state: TransactionModalState,
  onClick: () => void,
) => {
  if (state.details.flow === 'deposit' && state.stage === 'success') {
    return (
      <Button
        bottom="0"
        size={'2xl'}
        variant="subtle"
        width={'full'}
        colorPalette={'gray'}
        onClick={onClick}
        justifySelf="flex-end"
      >
        Deposit more
      </Button>
    );
  }
  return null;
};

const showTransactionStatusIcon = (state: TransactionModalState) => {
  switch (state.stage) {
    case 'none':
      return null;
    case 'success':
      return (
        <Box mb={8}>
          <CheckIcon
            style={{
              width: 'var(--chakra-sizes-16)',
              height: 'var(--chakra-sizes-16)',
            }}
          ></CheckIcon>
        </Box>
      );
    case 'error':
      return (
        <Box mb={8}>
          <CrossIcon
            style={{
              width: 'var(--chakra-sizes-16)',
              height: 'var(--chakra-sizes-16)',
            }}
          ></CrossIcon>
        </Box>
      );
    case 'collection':
    case 'awaiting':
    case 'signing':
      return <Spinner mb={8} size="xl" color="colorPalette.600"></Spinner>;
  }
};

export const TransactionModalContent = ({
  backToDashboard,
  onModalOpen,
  isDashboardAvailable,
}: {
  backToDashboard: () => void;
  onModalOpen: () => void;
  isDashboardAvailable: boolean;
}) => {
  const { dispatchModal, ...state } = useTransactionModal();
  const isOpen = state.isOpen;

  useEffect(() => {
    if (state.isOpen) {
      onModalOpen();
    }
  }, [state.isOpen, onModalOpen]);

  const onBackToDashboard = () => {
    dispatchModal({
      stage: 'none',
    });
    backToDashboard();
  };

  const onBackToSameTab = () => {
    dispatchModal({
      stage: 'none',
    });
  };

  return (
    <Presence
      present={isOpen}
      position={'absolute'}
      height={'full'}
      width={'full'}
      left={0}
      top={0}
      px={5}
      pb={6}
      pt={4}
    >
      <VStack
        flexDirection="column"
        textAlign="center"
        justifyContent="space-between"
        flex={1}
        display="flex"
        width={'full'}
        height={'full'}
        backgroundColor={'white'}
        position={'relative'}
      >
        <Center
          gap={0}
          mt={12}
          flexDirection="column"
          display="flex"
          width={'full'}
        >
          {showTransactionStatusIcon(state)}

          {getMainContent(state)}
          {showEtherscanLink(state)}
        </Center>
        <Center
          gap={4}
          flexDirection="column"
          display="flex"
          width={'full'}
          position={'absolute'}
          bottom={0}
        >
          {showBackToDashboardButton(state, onBackToDashboard, onBackToSameTab)}
          {showDepositMoreButton(state, onBackToSameTab)}
        </Center>
      </VStack>
    </Presence>
  );
};
