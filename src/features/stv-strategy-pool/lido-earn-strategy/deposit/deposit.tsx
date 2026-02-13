import React from 'react';
import {
  DepositPausedAlert,
  DepositPausedBecauseOfMintingAlert,
} from '@/shared/components/paused-alert';
import { FormContainer } from '@/shared/hook-form/container';
import { SubmitButton } from '@/shared/hook-form/controls';
// import { VaultDetails } from '../vault-details';

// import { DepositApy } from './deposit-apy';
import { DepositFormProvider } from './deposit-form-context';
import { DepositInputGroup } from './deposit-input-group';

export const Deposit = () => {
  return (
    <DepositFormProvider>
      <FormContainer>
        <DepositPausedAlert />
        <DepositPausedBecauseOfMintingAlert />
        <DepositInputGroup />
        {/* <DepositApy />
        <VaultDetails /> */}
        <SubmitButton>Deposit</SubmitButton>
      </FormContainer>
    </DepositFormProvider>
  );
};
