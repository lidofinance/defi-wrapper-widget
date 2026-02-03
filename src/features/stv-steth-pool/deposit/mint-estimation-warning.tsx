import { FormatToken } from '@/shared/formatters';
import { MINT_TOKENS_VALUE_TYPE } from '@/shared/hook-form/validation';
import { tokenLabel } from '@/utils/token-label';

export type MintEstimationWarningProps = {
  expectedMintedAmount?: bigint | null;
  maxMintableAmount: bigint;
  tokenToMint: MINT_TOKENS_VALUE_TYPE;
  isLimitedByLiability?: boolean;
  isLimitedByVaultCapacity?: boolean;
};
export const MintEstimationWarning = ({
  expectedMintedAmount,
  maxMintableAmount,
  tokenToMint,
  isLimitedByLiability,
  isLimitedByVaultCapacity,
}: MintEstimationWarningProps) => {
  if (!expectedMintedAmount) {
    return null;
  }

  const reason = isLimitedByVaultCapacity
    ? 'the minting limitation of this Staking Vault'
    : isLimitedByLiability
      ? 'your existing liability'
      : 'minting limitations';

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
      , but due to {reason},
      {maxMintableAmount > 0n ? (
        <>
          {' '}
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
