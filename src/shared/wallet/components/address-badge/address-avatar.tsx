import { useState } from 'react';
import { zeroAddress } from 'viem';
import { useEnsAvatar } from 'wagmi';
import { Spinner } from '@chakra-ui/react';
import { useMainnetOnlyWagmi } from '@/modules/web3';
import { Identicon } from '@/shared/components/identicon';
import styles from './address-avatar.module.css';

type AddressAvatarProps = {
  address?: string;
  ensName?: string | null;
};

export const AddressAvatar = ({ address, ensName }: AddressAvatarProps) => {
  const [isBrokenImage, setIsBrokenImage] = useState(false);
  const [isNativeImageLoading, setIsNativeImageLoading] = useState(false);
  const { mainnetConfig } = useMainnetOnlyWagmi();
  const {
    data: ensAvatar,
    isError: isEnsAvatarError,
    isLoading,
  } = useEnsAvatar({
    config: mainnetConfig,
    name: ensName ?? undefined,
  });

  if (isNativeImageLoading || isLoading) {
    return <Spinner className={styles.addressAvatarLoader} size="sm" />;
  }

  if (isBrokenImage || isEnsAvatarError || !ensName || !ensAvatar) {
    return <Identicon address={address ?? zeroAddress} />;
  }

  return (
    <img
      className={styles.addressAvatarImage}
      src={ensAvatar}
      alt={`${ensName} avatar`}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      onLoadStart={() => {
        setIsNativeImageLoading(true);
      }}
      onLoad={() => {
        setIsNativeImageLoading(false);
      }}
      onError={() => {
        setIsNativeImageLoading(false);
        setIsBrokenImage(true);
      }}
    />
  );
};
