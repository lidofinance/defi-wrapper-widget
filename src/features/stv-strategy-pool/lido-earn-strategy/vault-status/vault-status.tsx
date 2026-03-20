import { Button, HStack, Presence, Spacer, Text } from '@chakra-ui/react';
import { Rewards } from '@/shared/components/rewards';
import { Tooltip } from '@/shared/components/tooltip';
import {
  VaultInfo,
  VaultInfoEntry,
  VaultInfoSection,
} from '@/shared/components/vault-info';
import {
  FinalizedRequests,
  PendingRequests,
} from '@/shared/components/withdrawal-requests';
import { FormatPercent, FormatDate } from '@/shared/formatters';
import { fromBlockChainTime } from '@/utils/blockchain-time';
import { useEarnStrategyApy, useStrategyWithdrawalRequests } from '../hooks';

type VaultStatusProps = {
  showBoost?: boolean;
  showRewards?: boolean;
};

export const VaultStatus = ({
  showBoost = false,
  showRewards = false,
}: VaultStatusProps) => {
  const {
    isEmpty,
    isLoading,
    processableRequest,
    pendingEarnRequests,
    claimableEarnRequests,
    claimEarnWithdrawal,
    recoverable,
    recoverRewards,
    proxyPendingRequests,
    proxyFinalizedRequests,
    processWithdrawalRequest,
    isPendingAction,
    claim,
    boostable,
    boostAPY,
    proxyClaimableRewards,
  } = useStrategyWithdrawalRequests(showBoost);

  const { apySma, apySmaCurrent } = useEarnStrategyApy();

  const apyDifference = apySma && apySmaCurrent ? apySma - apySmaCurrent : null;

  if (isLoading || isEmpty) {
    return null;
  }

  return (
    <Presence
      present
      animationName={{ _open: 'fade-in', _closed: 'fade-out' }}
      animationDuration="moderate"
    >
      {showRewards && <Rewards />}
      <VaultInfo>
        {boostable && (
          <VaultInfoSection label={'Boost strategy APY'}>
            <HStack gap={2} alignItems="center" width="100%">
              <Text fontSize="sm" fontWeight="semibold" color="green">
                +
                <FormatPercent
                  value={apyDifference ?? undefined}
                  fallback={''}
                  decimals="percent"
                />
              </Text>
              <Spacer />
              <Button
                disabled={!boostAPY}
                loading={isPendingAction}
                onClick={() => boostAPY?.()}
                size={'xs'}
              >
                Boost
              </Button>
            </HStack>
          </VaultInfoSection>
        )}

        {pendingEarnRequests && pendingEarnRequests.length > 0 && (
          <VaultInfoSection label={'Pending withdrawals from Lido Earn ETH'}>
            {pendingEarnRequests.map((pendingRequest) => (
              <VaultInfoEntry
                key={pendingRequest.timestamp}
                token={'ETH'}
                amount={pendingRequest.unlockedETH}
                suffix={
                  <>
                    {pendingRequest.timestamp && (
                      <Text fontSize="xs" color="fg.subtle">
                        created on{' '}
                        <FormatDate
                          type="date"
                          date={fromBlockChainTime(pendingRequest.timestamp)}
                        />
                      </Text>
                    )}
                  </>
                }
              />
            ))}
          </VaultInfoSection>
        )}

        {claimableEarnRequests && claimableEarnRequests.length > 0 && (
          <VaultInfoSection label={'Claimable withdrawals from Lido Earn ETH'}>
            {claimableEarnRequests.map((claimableRequest) => (
              <VaultInfoEntry
                key={claimableRequest.timestamp}
                token={'ETH'}
                amount={claimableRequest.unlockedETH}
                suffix={
                  claimEarnWithdrawal && (
                    <Button
                      disabled={!claimEarnWithdrawal}
                      loading={isPendingAction}
                      onClick={() =>
                        claimEarnWithdrawal({
                          requestTimestamp: claimableRequest.timestamp,
                        })
                      }
                      size={'xs'}
                    >
                      Claim
                    </Button>
                  )
                }
              />
            ))}
          </VaultInfoSection>
        )}
        {processableRequest && (
          <VaultInfoSection
            label={'Processable withdrawal requests to stVault'}
          >
            <VaultInfoEntry
              token={'ETH'}
              amount={processableRequest.ethToReceive}
              suffix={
                <Tooltip
                  content={
                    processableRequest.isBelowMinimumThreshold
                      ? 'The total amount of ETH to withdraw is below the minimum threshold for processing.'
                      : processableRequest.isHealing
                        ? 'This will repay liability to the vault without withdrawing ETH.'
                        : 'Create a withdrawal request from stVault to later claim your ETH'
                  }
                >
                  <Button
                    disabled={
                      !processWithdrawalRequest ||
                      processableRequest.isBelowMinimumThreshold
                    }
                    loading={isPendingAction}
                    onClick={() => processWithdrawalRequest?.()}
                    size={'xs'}
                  >
                    {processableRequest.isHealing ? 'Heal Position' : 'Process'}
                  </Button>
                </Tooltip>
              }
            />
          </VaultInfoSection>
        )}

        <PendingRequests
          label={'Pending withdrawal requests from stVault'}
          requests={proxyPendingRequests}
        />
        <FinalizedRequests
          isClaimLoading={isPendingAction}
          onClaim={({ id, amountOfAssets, checkpointHint }) =>
            claim({ id, amountETH: amountOfAssets, checkpointHint })
          }
          requests={proxyFinalizedRequests}
        />
        {proxyClaimableRewards && proxyClaimableRewards.length > 0 && (
          <VaultInfoSection label={'Distributed rewards'}>
            {proxyClaimableRewards.map((claimableDistribution) => (
              <VaultInfoEntry
                key={
                  claimableDistribution.recipientUserAddress +
                  claimableDistribution.rewardToken
                }
                customSymbol={claimableDistribution.rewardTokenSymbol}
                customDecimals={claimableDistribution.rewardTokenDecimals}
                amount={claimableDistribution.previewClaim}
                suffix={
                  <Button
                    loading={isPendingAction}
                    onClick={() => claimableDistribution.claim()}
                    size={'xs'}
                  >
                    Claim
                  </Button>
                }
              />
            ))}
          </VaultInfoSection>
        )}
        {recoverable && (
          <VaultInfoSection label={'Rewards'}>
            <VaultInfoEntry
              token={'WSTETH'}
              amount={recoverable.stethSharesToRecover}
              suffix={
                <Button
                  disabled={!recoverRewards}
                  loading={isPendingAction}
                  onClick={() => recoverRewards?.()}
                  size={'xs'}
                >
                  Claim
                </Button>
              }
            />
          </VaultInfoSection>
        )}
      </VaultInfo>
    </Presence>
  );
};
