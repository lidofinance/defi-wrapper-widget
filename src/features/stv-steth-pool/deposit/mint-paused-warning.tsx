import { Alert } from '@chakra-ui/react';
import { FormatToken } from '@/shared/formatters';
import { MINT_TOKENS_VALUE_TYPE } from '@/shared/hook-form/validation';

export const MintPausedWarning = ({
  tokenToMint,
}: {
  tokenToMint: MINT_TOKENS_VALUE_TYPE;
}) => {
  return (
    <Alert.Root status="info" colorPalette={'orange'}>
      <Alert.Title>
        Minting is currently unavailable.{' '}
        <FormatToken
          amount={0n}
          token={tokenToMint}
          showSymbolOnFallback={true}
          fallback="N/A"
          trimEllipsis={true}
        />{' '}
        will be minted{' '}
      </Alert.Title>
    </Alert.Root>
  );
};
