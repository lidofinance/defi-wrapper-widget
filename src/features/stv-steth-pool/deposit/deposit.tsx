import React from 'react';
import { FormContainer } from '@/shared/hook-form/container';
import { SubmitButton } from '@/shared/hook-form/controls';
import { VaultDetails } from '../vault-details';

import { DepositFormProvider } from './deposit-form-context';
import { DepositInputGroup } from './deposit-input-group';
import { DepositApy } from './deposit-rewards';
import { MintEstimation } from './mint-estimation';

export const Deposit = () => {
  return (
    <DepositFormProvider>
      <FormContainer>
        <DepositInputGroup />
        <MintEstimation />
        <DepositApy />
        <VaultDetails />
        <SubmitButton>Deposit</SubmitButton>
      </FormContainer>
    </DepositFormProvider>
  );
};
