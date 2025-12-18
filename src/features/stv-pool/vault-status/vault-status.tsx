import React from 'react';
import { Presence } from '@chakra-ui/react';

import { useRequests } from '@/modules/defi-wrapper';
import { VaultInfo } from '@/shared/components/vault-info';

import { WithdrawalRequests } from './withdrawal-requests';

export const VaultStatus = () => {
  const { data: requests } = useRequests();

  if (!requests || requests?.isEmpty) {
    return null;
  }

  return (
    <Presence
      present={true}
      animationName={{ _open: 'fade-in', _closed: 'fade-out' }}
      animationDuration="moderate"
    >
      <VaultInfo>
        <WithdrawalRequests />
      </VaultInfo>
    </Presence>
  );
};
