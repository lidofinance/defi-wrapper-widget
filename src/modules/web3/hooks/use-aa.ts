import { useCapabilities, useConnectorClient } from 'wagmi';
import { useDappStatus } from './use-dapp-status';
import type { RegisteredConfig } from '../types';

const isCapabilitySupported = (capability?: {
  supported?: boolean; // deprecated,legacy
  status?:
    | 'ready' // can promt user to swith to one
    | 'supported' // already has smart account
    | 'unsupported'; // cannot use smart account
}) => {
  if (!capability) return false;

  if (typeof capability.status === 'string') {
    return capability.status === 'supported';
  }

  return !!capability.supported;
};

const scopeKey = (
  client: ReturnType<typeof useConnectorClient<RegisteredConfig>>['data'],
) => {
  if (!client) return 'aa-not-connected';
  return `aa-${client.uid ?? '<no-uid>'}-${client.account?.address ?? '<no-address>'}-${client.chain?.id ?? '<no-chain>'}-${client.key ?? '<no-key>'}-${client.name ?? '<no-name>'}`;
};

export const useAA = () => {
  const { data: connectorClient } = useConnectorClient();
  const { chainId, isAccountActive } = useDappStatus();
  const capabilitiesQuery = useCapabilities({
    query: {
      enabled: isAccountActive,
    },
    // this cachebuster ensures we re-fetch capabilities when wallet/account/chain changes on edgecases when 2 wallets share same account
    scopeKey: scopeKey(connectorClient),
  });

  // merge capabilities per https://eips.ethereum.org/EIPS/eip-5792
  const capabilities = capabilitiesQuery.data
    ? {
        ...(capabilitiesQuery.data[0] ?? {}),
        ...(capabilitiesQuery.data[chainId] ?? {}),
      }
    : undefined;

  const isAtomicBatchSupported =
    isCapabilitySupported(capabilities?.atomic) ||
    // legacy
    isCapabilitySupported(capabilities?.atomicBatch);

  const areAuxiliaryFundsSupported = isCapabilitySupported(
    capabilities?.auxiliaryFunds,
  );

  // per EIP-5792 ANY successful call to getCapabilities is a sign of EIP support
  // but MM is not following the spec properly
  const isAA = capabilitiesQuery.isFetched && isAtomicBatchSupported;

  return {
    ...capabilitiesQuery,
    isAA,
    capabilities,
    isAtomicBatchSupported,
    areAuxiliaryFundsSupported,
  };
};
