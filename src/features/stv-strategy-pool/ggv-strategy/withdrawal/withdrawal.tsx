import { VStack } from '@chakra-ui/react';
import { FormContainer } from '@/shared/hook-form/container';
import { SubmitButton } from '@/shared/hook-form/controls';
import { WaitingTime } from '@/shared/wrapper/withdrawal/waiting-time';
import { VaultStatus } from '../vault-status';
import { PositionHealthWarning } from './position-health-warning';
import { WithdrawalFormProvider } from './withdrawal-form-context';
import { WithdrawalInputGroup } from './withdrawal-input-group';

export const Withdrawal = () => {
  return (
    <WithdrawalFormProvider>
      <FormContainer>
        <VStack align="stretch" gap={6}>
          <VaultStatus />
          <WithdrawalInputGroup />
          <PositionHealthWarning />
          <WaitingTime waitingTime="5 days" />
          <SubmitButton>Withdraw from Strategy</SubmitButton>
        </VStack>
      </FormContainer>
    </WithdrawalFormProvider>
  );
};
