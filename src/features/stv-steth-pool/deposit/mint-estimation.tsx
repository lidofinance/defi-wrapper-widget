import { useFormContext, useWatch } from 'react-hook-form';
import { Alert, Flex, Text } from '@chakra-ui/react';
import { useVaultCapacity } from '@/modules/defi-wrapper';
import { MintTokenSwitch } from '@/shared/components/mint-token-switch';
import { FormatPercent, FormatToken } from '@/shared/formatters';
import { FormatTokenWithIcon } from '@/shared/formatters/format-token-with-icon';
import { MINT_TOKENS_VALUE_TYPE } from '@/shared/hook-form/validation';
import { DepositFormValues } from './deposit-form-context/types';

import { usePreviewMint } from './hooks/use-preview-mint';
import { MintEstimationWarning } from './mint-estimation-warning';
import { ReserveRatioTooltip } from './reserve-ratio-tooltip';

export const MintEstimation = () => {
  const tokenToMint = useWatch<DepositFormValues, 'tokenToMint'>({
    name: 'tokenToMint',
  });

  const { setValue } = useFormContext<DepositFormValues>();

  // preview minted (w)steth and if they corresond to depsoit amount by RR (tokenToMint aware)
  const { isLoading, shouldShowWarning, mintingSpread, expectedMint, maxMint } =
    usePreviewMint();
  const { data: vaultCapacity } = useVaultCapacity();

  const isPositiveMint = mintingSpread > 0n;

  const onTokenChange = (newToken: MINT_TOKENS_VALUE_TYPE) => {
    setValue('tokenToMint', newToken);
  };

  return (
    <>
      <Flex justify="space-between" align="flex-start" gap={1}>
        <MintTokenSwitch
          label={'Receive'}
          token={tokenToMint}
          onTokenChange={onTokenChange}
        />
        <Flex direction="column" alignItems="flex-end" gap={1}>
          <FormatTokenWithIcon
            alignItems="center"
            gap={1}
            position="relative"
            fontWeight="semibold"
            color={
              shouldShowWarning
                ? isPositiveMint
                  ? 'green'
                  : 'fg.warning'
                : undefined
            }
            pr={1}
            token={tokenToMint}
            isLoading={isLoading}
            amount={maxMint}
          />
          <Text fontSize="sm" color={'fg.subtle'}>
            Reserve ratio{' '}
            <FormatPercent
              decimals="percent"
              value={vaultCapacity?.reserveRatioPercent}
            />{' '}
            <ReserveRatioTooltip
              tokenToMint={tokenToMint}
              reserveRatioPercent={vaultCapacity?.reserveRatioPercent}
            />
          </Text>
        </Flex>
      </Flex>
      {shouldShowWarning && (
        <Alert.Root
          status="info"
          colorPalette={isPositiveMint ? 'green' : 'orange'}
        >
          <Alert.Title>
            {isPositiveMint ? (
              <>
                Extra{' '}
                <FormatToken
                  amount={mintingSpread}
                  token={tokenToMint}
                  showSymbolOnFallback={true}
                  fallback="N/A"
                  trimEllipsis={true}
                />{' '}
                will be minted due to existing minting capacity.
              </>
            ) : (
              <MintEstimationWarning
                tokenToMint={tokenToMint}
                expectedMintedAmount={expectedMint}
                maxMintableAmount={maxMint}
              />
            )}
          </Alert.Title>
        </Alert.Root>
      )}
    </>
  );
};
