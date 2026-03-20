import React from 'react';
import { Presence } from '@chakra-ui/react';

import { useRequests, useRewards } from '@/modules/defi-wrapper';
import { Rewards } from '@/shared/components/rewards';
import { VaultInfo } from '@/shared/components/vault-info';

import { WithdrawalRequests } from './withdrawal-requests';

type VaultStatusProps = {
  showRewards?: boolean;
};

export const VaultStatus = ({ showRewards = false }: VaultStatusProps) => {
  const { data: requests } = useRequests();
  const { data: rewards } = useRewards();

  const shouldShowRequests = requests && !requests.isEmpty;
  const shouldShowRewards = showRewards && !!rewards && !rewards.isEmpty;

  const shouldShowStatus = shouldShowRequests || shouldShowRewards;

  if (!shouldShowStatus) {
    return null;
  }

  return (
    <Presence
      present
      animationName={{ _open: 'fade-in', _closed: 'fade-out' }}
      animationDuration="moderate"
    >
      <VaultInfo>
        <WithdrawalRequests />
        {shouldShowRewards && <Rewards />}
      </VaultInfo>
    </Presence>
  );
};
