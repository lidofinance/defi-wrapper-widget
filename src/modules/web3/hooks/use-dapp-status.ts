import { useAccount } from 'wagmi';
import { useDappChain } from '@/modules/web3/web3-provider/dapp-chain';

export const useDappStatus = () => {
  const {
    address,
    addresses,
    chainId: walletChainId,
    isConnected: isWalletConnected,
  } = useAccount();

  // this can change between pages based on their dapp-chain contexts(or lack of)
  const dappChain = useDappChain();

  const { isSupportedChain, isChainTypeMatched } = dappChain;

  const isAccountActive = walletChainId
    ? isWalletConnected && isSupportedChain
    : false;

  const isDappActive = isAccountActive && isChainTypeMatched;

  // no useMemo because memoisation is more expensive than boolean flags
  // hook is used in many places and every usage would create separate memoisation
  return {
    ...dappChain,
    isAccountActive,
    isDappActive,
    isWalletConnected,
    walletChainId,
    address,
    addresses,
  };
};
