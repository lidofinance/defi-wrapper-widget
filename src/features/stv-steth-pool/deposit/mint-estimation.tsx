import { useFormContext, useWatch } from 'react-hook-form';
import { Alert, Flex, Skeleton, Text } from '@chakra-ui/react';
import { useStvSteth, useVaultCapacity } from '@/modules/defi-wrapper';
import { MintTokenSwitch } from '@/shared/components/mint-token-switch';
import { FormatPercent, FormatToken } from '@/shared/formatters';
import { FormatTokenWithIcon } from '@/shared/formatters/format-token-with-icon';
import { MINT_TOKENS_VALUE_TYPE } from '@/shared/hook-form/validation';
import { DepositFormValues } from './deposit-form-context/types';

import { usePreviewMint } from './hooks/use-preview-mint';
import { MintEstimationWarning } from './mint-estimation-warning';
import { MintPausedWarning } from './mint-paused-warning';
import { ReserveRatioTooltip } from './reserve-ratio-tooltip';

type MintEstimationAlertProps = {
  isLimitedByLiability?: boolean;
  isLimitedByVaultCapacity?: boolean;
  tokenToMint: MINT_TOKENS_VALUE_TYPE;
  isPositiveMint: boolean;
  maxMint: bigint;
  expectedMint: bigint;
  mintingSpread: bigint;
};

const MintEstimationAlert = ({
  tokenToMint,
  isPositiveMint,
  maxMint,
  expectedMint,
  mintingSpread,
  isLimitedByLiability,
  isLimitedByVaultCapacity,
}: MintEstimationAlertProps) => {
  return (
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
            isLimitedByLiability={isLimitedByLiability}
            isLimitedByVaultCapacity={isLimitedByVaultCapacity}
          />
        )}
      </Alert.Title>
    </Alert.Root>
  );
};

export const MintEstimation = () => {
  const tokenToMint = useWatch<DepositFormValues, 'tokenToMint'>({
    name: 'tokenToMint',
  });
  const errors = useFormContext().formState.errors;

  const { mintingPaused } = useStvSteth();

  const { setValue } = useFormContext<DepositFormValues>();

  // preview minted (w)steth and if they correspond to depsoit amount by RR (tokenToMint aware)
  const {
    isLoading,
    shouldShowWarning,
    expectedMint,
    mintingSpread,
    maxMint,
    data,
  } = usePreviewMint();
  const { data: vaultCapacity, isPending: isVaultCapacityLoading } =
    useVaultCapacity();

  const isPositiveMint = mintingSpread > 0n;

  const onTokenChange = (newToken: MINT_TOKENS_VALUE_TYPE) => {
    setValue('tokenToMint', newToken);
  };

  const showMintAmountWarnings =
    shouldShowWarning && Object.keys(errors).length === 0;
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
            <Skeleton
              as={'span'}
              width={'68px'}
              loading={isVaultCapacityLoading}
            >
              <FormatPercent
                decimals="percent"
                value={vaultCapacity?.reserveRatioPercent}
              />{' '}
              <ReserveRatioTooltip
                tokenToMint={tokenToMint}
                reserveRatioPercent={vaultCapacity?.reserveRatioPercent}
              />
            </Skeleton>
          </Text>
        </Flex>
      </Flex>
      {mintingPaused ? <MintPausedWarning tokenToMint={tokenToMint} /> : <></>}
      {!mintingPaused && showMintAmountWarnings ? (
        <MintEstimationAlert
          tokenToMint={tokenToMint}
          mintingSpread={mintingSpread}
          isPositiveMint={isPositiveMint}
          isLimitedByLiability={data?.isLimitedByLiability}
          isLimitedByVaultCapacity={data?.isLimitedByVaultCapacity}
          maxMint={maxMint}
          expectedMint={expectedMint}
        />
      ) : (
        <></>
      )}
    </>
  );
};
