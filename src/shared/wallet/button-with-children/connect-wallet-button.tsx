import { FC, PropsWithChildren } from 'react';
import { useDappStatus } from '@/modules/web3';
import { Connect } from '@/shared/wallet';

export const ConnectWalletButton: FC<PropsWithChildren> = ({ children }) => {
  const { isWalletConnected } = useDappStatus();

  if (isWalletConnected) {
    return <>{children}</>;
  }

  return <Connect size={'2xl'} mt={6} />;
};
