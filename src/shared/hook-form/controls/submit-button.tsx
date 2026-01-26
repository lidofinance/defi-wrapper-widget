import { MouseEvent, useCallback, useMemo } from 'react';
import { useFormState } from 'react-hook-form';
import { useConnect } from 'reef-knot/core-react';
import { Button } from '@chakra-ui/react';
import { useUserConfig } from '@/config/user-config/hooks';
import { useWalletWhitelisted } from '@/modules/defi-wrapper/hooks/use-wallet-whitelisted';
import { useDappStatus } from '@/modules/web3';

export type SubmitButtonProps = {
  isLoading?: boolean;
};
export const SubmitButton = ({
  children,
  isLoading,
}: React.PropsWithChildren & SubmitButtonProps) => {
  const { connect } = useConnect();

  const { defaultChain } = useUserConfig();
  const {
    isDappActive,
    isSupportedChain,
    isWalletConnected,
    supportedChainLabels,
  } = useDappStatus();

  const { isWalletWhitelisted } = useWalletWhitelisted();
  const { isValidating, isSubmitting } = useFormState();

  const shouldConnectWallet = !isWalletConnected || !isDappActive;
  const buttonDisabled =
    isWalletConnected && (!isWalletWhitelisted || !isSupportedChain);

  const content = useMemo(() => {
    if (!isSupportedChain) {
      return <>Switch to {supportedChainLabels[defaultChain]}</>;
    }

    if (shouldConnectWallet) {
      return <>Connect Wallet</>;
    }

    if (isWalletWhitelisted === false) {
      return <>This wallet is not whitelisted</>;
    }
    return children;
  }, [
    isSupportedChain,
    isWalletWhitelisted,
    children,
    defaultChain,
    shouldConnectWallet,
    supportedChainLabels,
  ]);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (shouldConnectWallet && connect) {
        e.preventDefault();
        e.stopPropagation();
        void connect();
      }
    },
    [connect, shouldConnectWallet],
  );

  return (
    <Button
      disabled={buttonDisabled}
      type="submit"
      size={'2xl'}
      loading={isValidating || isSubmitting || isLoading}
      onClick={handleClick}
    >
      {content}
    </Button>
  );
};
