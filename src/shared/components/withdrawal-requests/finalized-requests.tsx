import { Button } from '@chakra-ui/react';
import {
  VaultInfoEntry,
  VaultInfoSection,
} from '@/shared/components/vault-info';
import { FinalizedWithdrawalRequest } from './types';

type FinalizedRequestsProps = {
  requests?: FinalizedWithdrawalRequest[];
  onClaim: (request: FinalizedWithdrawalRequest) => void;
  isClaimLoading?: boolean;
};

export const FinalizedRequests = ({
  requests,
  onClaim,
  isClaimLoading = false,
}: FinalizedRequestsProps) => {
  if (!requests || requests.length === 0) {
    return null;
  }

  return (
    <VaultInfoSection label="Available to claim">
      {requests.map((request) => (
        <VaultInfoEntry
          key={request.id}
          token={'ETH'}
          amount={request.amountOfAssets}
          suffix={
            <Button
              loading={isClaimLoading}
              onClick={() => onClaim(request)}
              size={'xs'}
            >
              Claim
            </Button>
          }
        />
      ))}
    </VaultInfoSection>
  );
};
