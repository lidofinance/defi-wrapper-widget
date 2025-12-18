import type { Hash } from 'viem';
import { useShowCallsStatus } from 'wagmi';
import { Button } from '@chakra-ui/react';
import { USER_CONFIG } from '@/config';
import { useDappStatus } from '@/modules/web3';
import { ETHERSCAN_ENTITIES, getEtherscanLink } from '@/utils/etherscan';

type TxLinkEtherscanProps = {
  text?: string;
  txHash?: Hash;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

type TxLinkAAProps = { callId: string };

export const TxLinkAA = ({ callId }: TxLinkAAProps) => {
  const { showCallsStatus, isPending } = useShowCallsStatus();
  return (
    <Button
      variant={'plain'}
      color={'blue.600'}
      fontSize="sm"
      aria-hidden={isPending}
      onClick={() => {
        if (!isPending) {
          showCallsStatus({ id: callId });
        }
      }}
    >
      Show transaction in wallet
    </Button>
  );
};

export const TxLinkEtherscan = (props: TxLinkEtherscanProps) => {
  const { txHash, text = 'View on Etherscan', onClick } = props;
  const { walletChainId } = useDappStatus();
  const etherscanLink = getEtherscanLink(
    walletChainId ?? USER_CONFIG.defaultChain,
    txHash as string,
    ETHERSCAN_ENTITIES.TX,
  );
  if (!txHash) return null;

  return (
    <Button asChild variant={'plain'} color={'blue.600'} fontSize="sm">
      <a onClick={onClick} href={etherscanLink} target="_blank">
        {text}
      </a>
    </Button>
  );
};
