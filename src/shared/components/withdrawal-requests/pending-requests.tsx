import { Text } from '@chakra-ui/react';
import {
  VaultInfoEntry,
  VaultInfoSection,
} from '@/shared/components/vault-info';
import { FormatDate } from '@/shared/formatters';
import { fromBlockChainTime } from '@/utils/blockchain-time';
import { WithdrawalRequest } from './types';

type PendingRequestsProps = {
  requests?: WithdrawalRequest[];
  label?: React.ReactNode;
};

export const PendingRequests = ({ requests, label }: PendingRequestsProps) => {
  if (!requests || requests.length === 0) {
    return null;
  }

  return (
    <VaultInfoSection label={label ?? 'Pending withdrawal requests'}>
      {requests.map((request) => (
        <VaultInfoEntry
          key={request.id}
          token={request.token ?? 'ETH'}
          amount={request.amountOfAssets}
          suffix={
            request.timestamp ? (
              <Text fontSize="xs" color="fg.subtle">
                created on{' '}
                <FormatDate
                  type="date"
                  date={fromBlockChainTime(request.timestamp)}
                />
              </Text>
            ) : null
          }
        />
      ))}
    </VaultInfoSection>
  );
};
