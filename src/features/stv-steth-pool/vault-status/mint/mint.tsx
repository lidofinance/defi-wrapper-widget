import { useMemo, useState } from 'react';
import { Button } from '@chakra-ui/react';
import { MintTokenSwitch } from '@/shared/components/mint-token-switch';
import {
  VaultInfoEntry,
  VaultInfoSection,
} from '@/shared/components/vault-info';
import { MINT_TOKENS_VALUE_TYPE } from '@/shared/hook-form/validation';
import { useAvailableMint } from './use-available-mint';
import { useMintRequest } from './use-mint-request';

type MintedStethProps = {
  amount?: bigint;
  token: MINT_TOKENS_VALUE_TYPE;
  onTokenChange: (t: MINT_TOKENS_VALUE_TYPE) => void;
};

type MintableStethProps = {
  amount?: bigint;
  amountStethShares?: bigint;
  token: MINT_TOKENS_VALUE_TYPE;
};

const MintedSteth = ({ token, onTokenChange, amount }: MintedStethProps) => {
  if (!amount) {
    return null;
  }

  return (
    <VaultInfoSection
      label={
        <MintTokenSwitch
          label={'Minted'}
          token={token}
          onTokenChange={onTokenChange}
        />
      }
    >
      <VaultInfoEntry token={token} amount={amount} />
    </VaultInfoSection>
  );
};

const MintableSteth = ({
  amount,
  amountStethShares,
  token,
}: MintableStethProps) => {
  const { mint, mutation } = useMintRequest();

  if (!amount || !amountStethShares) {
    return null;
  }

  return (
    <VaultInfoSection label="Available to mint">
      <VaultInfoEntry
        token={token}
        amount={amount}
        suffix={
          <Button
            loading={mutation.isPending}
            onClick={() =>
              mint({
                tokenAmount: amount,
                token,
                stethSharesToMint: amountStethShares,
              })
            }
            size={'xs'}
          >
            Mint
          </Button>
        }
      />
    </VaultInfoSection>
  );
};

export const Mint = () => {
  const {
    totalMintedSteth,
    mintableSteth,
    totalMintedStethShares,
    mintableShares,
    isSustainableMint,
    isEmpty,
  } = useAvailableMint();
  const [token, setToken] = useState<MINT_TOKENS_VALUE_TYPE>('STETH');

  if (isEmpty) {
    return null;
  }
  const { mintedAmount, mintableAmount } = useMemo(
    () => ({
      mintedAmount:
        token === 'STETH' ? totalMintedSteth : totalMintedStethShares,
      mintableAmount: token === 'STETH' ? mintableSteth : mintableShares,
    }),
    [
      totalMintedSteth,
      totalMintedStethShares,
      mintableShares,
      mintableSteth,
      token,
    ],
  );

  return (
    <>
      <MintedSteth
        amount={mintedAmount}
        onTokenChange={setToken}
        token={token}
      />
      {isSustainableMint && (
        <MintableSteth
          amount={mintableAmount}
          amountStethShares={mintableShares}
          token={token}
        />
      )}
    </>
  );
};
