import React from 'react';
import { FormContainer } from '@/shared/hook-form/container';
import { SubmitButton } from '@/shared/hook-form/controls';

import { DepositApy } from './deposit-apy';
import { DepositFormProvider } from './deposit-form-context';
import { DepositInputGroup } from './deposit-input-group';
import { VaultDetails } from '../vault-details';

export const Deposit = () => {
  return (
    <DepositFormProvider>
      <FormContainer>
        <DepositInputGroup />
        <DepositApy />
        <VaultDetails />
        <SubmitButton>Deposit</SubmitButton>
      </FormContainer>
    </DepositFormProvider>
  );
};
