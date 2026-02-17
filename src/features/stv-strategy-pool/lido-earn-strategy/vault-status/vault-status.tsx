// import { Button, HStack, Presence, Spacer, Text } from '@chakra-ui/react';
// import { Tooltip } from '@/shared/components/tooltip';
// import {
//   VaultInfo,
//   VaultInfoEntry,
//   VaultInfoSection,
// } from '@/shared/components/vault-info';
// import {
//   FinalizedRequests,
//   PendingRequests,
// } from '@/shared/components/withdrawal-requests';
// import { FormatDate, FormatPercent } from '@/shared/formatters';
// import { fromBlockChainTime } from '@/utils/blockchain-time';
// // import { useGGVStrategyApy } from '../hooks/use-ggv-strategy-apy';
// // import { useStrategyWithdrawalRequests } from '../hooks/use-strategy-withdrawal-requests';
// import { Rewards } from '../vault-status/rewards';

// type VaultStatusProps = {
//   showBoost?: boolean;
//   showRewards?: boolean;
// };

// export const VaultStatus = ({
//   showBoost = false,
//   showRewards = false,
// }: VaultStatusProps) => {
//   const {
//     isEmpty,
//     isLoading,
//     ggvPendingRequests,
//     ggvExpiredRequests,
//     processableRequest,
//     recoverable,
//     recoverRewards,
//     proxyPendingRequests,
//     proxyFinalizedRequests,
//     processWithdrawalRequest,
//     isPendingAction,
//     claim,
//     cancelRequest,
//     boostable,
//     boostAPY,
//   } = useStrategyWithdrawalRequests(showBoost);

//   const { apySma, apySmaCurrent } = useGGVStrategyApy();

//   const apyDifference = apySma && apySmaCurrent ? apySma - apySmaCurrent : null;
//   const isDifferenceSustainable = apyDifference !== null && apyDifference > 0.1;

//   if (isLoading || isEmpty) {
//     return null;
//   }

//   return (
//     <Presence
//       present={true}
//       animationName={{ _open: 'fade-in', _closed: 'fade-out' }}
//       animationDuration="moderate"
//     >
//       {showRewards && <Rewards />}
//       <VaultInfo>
//         {boostable && isDifferenceSustainable && (
//           <VaultInfoSection label={'Boost strategy APY'}>
//             <HStack gap={2} alignItems="center" width="100%">
//               <Text fontSize="sm" fontWeight="semibold" color="green">
//                 +<FormatPercent value={apyDifference} decimals="percent" />
//               </Text>
//               <Spacer />
//               <Button
//                 disabled={!boostAPY}
//                 loading={isPendingAction}
//                 onClick={() => boostAPY?.()}
//                 size={'xs'}
//               >
//                 Boost
//               </Button>
//             </HStack>
//           </VaultInfoSection>
//         )}
//         {ggvExpiredRequests && ggvExpiredRequests.length > 0 && (
//           <VaultInfoSection label={'Expired withdrawals from GGV'}>
//             {ggvExpiredRequests.map((expiredRequest) => (
//               <VaultInfoEntry
//                 key={expiredRequest.id}
//                 token={expiredRequest.token}
//                 amount={expiredRequest.amountOfAssets}
//                 suffix={
//                   <>
//                     {expiredRequest.timestamp && (
//                       <Text fontSize="xs" color="fg.warning">
//                         expired on{' '}
//                         <FormatDate
//                           type="date"
//                           date={fromBlockChainTime(
//                             BigInt(
//                               expiredRequest.metadata.creationTime +
//                                 expiredRequest.metadata.secondsToDeadline,
//                             ),
//                           )}
//                         />
//                       </Text>
//                     )}
//                     {cancelRequest && (
//                       <Button
//                         color={'colorPalette.warning'}
//                         disabled={!cancelRequest}
//                         loading={isPendingAction}
//                         onClick={() =>
//                           cancelRequest({
//                             requestMetadata: expiredRequest.metadata,
//                           })
//                         }
//                         size={'xs'}
//                       >
//                         Cancel
//                       </Button>
//                     )}
//                   </>
//                 }
//               />
//             ))}
//           </VaultInfoSection>
//         )}
//         {ggvPendingRequests && ggvPendingRequests.length > 0 && (
//           <VaultInfoSection label={'Pending withdrawals from GGV'}>
//             {ggvPendingRequests.map((pendingRequest) => (
//               <VaultInfoEntry
//                 key={pendingRequest.id}
//                 token={pendingRequest.token}
//                 amount={pendingRequest.amountOfAssets}
//                 suffix={
//                   <>
//                     {pendingRequest.timestamp && (
//                       <Text fontSize="xs" color="fg.subtle">
//                         created on{' '}
//                         <FormatDate
//                           type="date"
//                           date={fromBlockChainTime(pendingRequest.timestamp)}
//                         />
//                       </Text>
//                     )}
//                     {cancelRequest && (
//                       <Button
//                         variant={'ghost'}
//                         disabled={!cancelRequest}
//                         loading={isPendingAction}
//                         onClick={() =>
//                           cancelRequest({
//                             requestMetadata: pendingRequest.metadata,
//                           })
//                         }
//                         size={'xs'}
//                       >
//                         Cancel
//                       </Button>
//                     )}
//                   </>
//                 }
//               />
//             ))}
//           </VaultInfoSection>
//         )}
//         {processableRequest && (
//           <VaultInfoSection label={'Processable withdrawal requests'}>
//             <VaultInfoEntry
//               token={'ETH'}
//               amount={processableRequest.ethToReceive}
//               suffix={
//                 <Tooltip
//                   content={
//                     processableRequest.isBelowMinimumThreshold
//                       ? 'The total amount of ETH to withdraw is below the minimum threshold for processing.'
//                       : processableRequest.isHealing
//                         ? 'This will repay liability to the vault without withdrawing ETH.'
//                         : 'Create a withdrawal request from stVault to later claim your ETH'
//                   }
//                 >
//                   <Button
//                     disabled={
//                       !processWithdrawalRequest ||
//                       processableRequest.isBelowMinimumThreshold
//                     }
//                     loading={isPendingAction}
//                     onClick={() => processWithdrawalRequest?.()}
//                     size={'xs'}
//                   >
//                     {processableRequest.isHealing ? 'Heal Position' : 'Process'}
//                   </Button>
//                 </Tooltip>
//               }
//             />
//           </VaultInfoSection>
//         )}
//         <PendingRequests requests={proxyPendingRequests} />
//         <FinalizedRequests
//           isClaimLoading={isPendingAction}
//           onClaim={({ id, amountOfAssets, checkpointHint }) =>
//             claim({ id, amountETH: amountOfAssets, checkpointHint })
//           }
//           requests={proxyFinalizedRequests}
//         />
//         {recoverable && (
//           <VaultInfoSection label={'Rewards'}>
//             <VaultInfoEntry
//               token={'WSTETH'}
//               amount={recoverable.stethSharesToRecover}
//               suffix={
//                 <Button
//                   disabled={!recoverRewards}
//                   loading={isPendingAction}
//                   onClick={() => recoverRewards?.()}
//                   size={'xs'}
//                 >
//                   Claim
//                 </Button>
//               }
//             />
//           </VaultInfoSection>
//         )}
//       </VaultInfo>
//     </Presence>
//   );
// };
