import React from 'react';
import { FormatToken } from '@/shared/formatters';
import { tokenLabel } from '@/utils/token-label';
import { MintableTokens } from './deposit-form-context/types';

export type MintEstimationWarningProps = {
  expectedMintedAmount?: bigint | null;
  maxMintableAmount: bigint;
  tokenToMint: MintableTokens;
};
export const MintEstimationWarning = ({
  expectedMintedAmount,
  maxMintableAmount,
  tokenToMint,
}: MintEstimationWarningProps) => {
  if (!expectedMintedAmount) {
    return null;
  }
  return (
    <>
      Your minting capacity is{' '}
      <FormatToken
        amount={expectedMintedAmount}
        token={tokenToMint}
        showSymbolOnFallback={true}
        fallback="N/A"
        trimEllipsis={true}
      />{' '}
      , but due to the minting limitation on Staking Vault,
      {maxMintableAmount > 0n ? (
        <>
          only{' '}
          <FormatToken
            amount={maxMintableAmount}
            token={tokenToMint}
            showSymbolOnFallback={true}
            fallback="N/A"
            trimEllipsis={true}
          />{' '}
          can be minted.
        </>
      ) : (
        <>{tokenLabel(tokenToMint)} can not be minted.</>
      )}
    </>
  );
};
