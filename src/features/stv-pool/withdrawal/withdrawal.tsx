import { Flex, VStack } from '@chakra-ui/react';
import { WithdrawalPausedAlert } from '@/shared/components/paused-alert';
import { FormContainer } from '@/shared/hook-form/container';
import { SubmitButton } from '@/shared/hook-form/controls';
import { WaitingTime } from '@/shared/wrapper/withdrawal/waiting-time';
import { VaultStatus } from '../vault-status';
import { WithdrawalFormProvider } from './withdrawal-form-context';
import { WithdrawalInputGroup } from './withdrawal-input-group';

export const Withdrawal = () => {
  const waitingTime = '5 days';

  return (
    <WithdrawalFormProvider>
      <FormContainer>
        <WithdrawalPausedAlert />
        <VStack align="stretch" gap={6}>
          <VaultStatus />
          <Flex direction="column" gap={3}>
            <WithdrawalInputGroup />
          </Flex>
          <WaitingTime waitingTime={waitingTime} mb={6} />
          <SubmitButton>Withdraw</SubmitButton>
        </VStack>
      </FormContainer>
    </WithdrawalFormProvider>
  );
};
