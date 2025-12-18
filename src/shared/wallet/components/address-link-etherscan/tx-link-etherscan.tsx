import React, { useCallback } from 'react';
import type { Address } from 'viem';
import { useChainId } from 'wagmi';
import { FiExternalLink } from 'react-icons/fi';
import { Button } from '@chakra-ui/react';
import { trimAddress } from '@/shared/components/address';
import { getEtherscanAddressLink } from '@/utils/etherscan';
import { openWindow } from '@/utils/open-window';

type AddressLinkEtherscanProps = {
  text?: string;
  address?: Address;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export const AddressLinkEtherscan = (props: AddressLinkEtherscanProps) => {
  const { address } = props;
  const chainId = useChainId();
  const handleEtherscan = useCallback(() => {
    // This component is wrapped by SupportL1Chains,
    // but not wrapped by SupportL2Chains (the chainId will never be a L2 network).
    // This is currently the fastest solution.
    const link = getEtherscanAddressLink(chainId, address ?? '');
    openWindow(link);
  }, [address, chainId]);

  if (!address) return null;

  return (
    <Button
      data-testid="etherscanBtn"
      onClick={handleEtherscan}
      size="xs"
      variant="plain"
    >
      {trimAddress(address, 3)}
      <FiExternalLink />
    </Button>
  );
};
