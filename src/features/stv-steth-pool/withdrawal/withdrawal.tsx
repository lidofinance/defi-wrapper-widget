import React from 'react';
import { VStack } from '@chakra-ui/react';
import { FormContainer } from '@/shared/hook-form/container';
import { VaultStatus } from '../vault-status';
import { WithdrawalFormProvider } from './withdrawal-form-context';
import { WithdrawalInputGroup } from './withdrawal-input-group';

export const Withdrawal = () => {
  return (
    <WithdrawalFormProvider>
      <FormContainer>
        <VStack align="stretch" gap={6}>
          <VaultStatus showWithdrawalRequests={true} />
          <WithdrawalInputGroup />
        </VStack>
      </FormContainer>
    </WithdrawalFormProvider>
  );
};
