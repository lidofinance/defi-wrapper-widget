import { ReactNode } from 'react';
import { Flex, Text, VStack } from '@chakra-ui/react';
import { useDefiWrapper, useWrapperTvl } from '@/modules/defi-wrapper';
import { useVaultApr, useVaultFees } from '@/modules/vaults';
import { trimAddress } from '@/shared/components/address';
import { InfoRow } from '@/shared/components/info-row/info-row';
import { FormatPercent, FormatPrice, FormatToken } from '@/shared/formatters';
import { AddressLinkEtherscan } from '@/shared/wallet/components/address-link-etherscan';
import { APYTooltip } from '@/shared/wrapper/apy-tooltip';

export type VaultDetailsContentProps = {
  showLiquidityFee: boolean;
  vaultDescription: ReactNode | string;
  additionalContent?: ReactNode;
};

export const VaultDetailsContent = ({
  showLiquidityFee,
  vaultDescription,
  additionalContent,
}: VaultDetailsContentProps) => {
  const { wrapper } = useDefiWrapper();
  const { data: aprData, isLoading: isLoadingApr } = useVaultApr();
  const { data: feesData, isLoading: isLoadingFees } = useVaultFees();

  const { tvlETH, tvlUSD, isLoading: isTVLLoading } = useWrapperTvl();
  const contractAddress = wrapper.address;

  return (
    <VStack align="stretch" divideY="1px" gap={0} mb={3}>
      <Flex direction="column" mb={6} gap={6} width={'full'}>
        <Text fontSize="sm">{vaultDescription}</Text>
        <InfoRow
          description={
            <Flex gap={1} alignItems="center">
              APY{' '}
              <APYTooltip
                APY={aprData?.aprSma}
                isLoading={isLoadingApr}
                lastUpdate={aprData?.updatedAt}
                customContent={additionalContent}
              />
            </Flex>
          }
          isLoading={isLoadingApr}
          info={<FormatPercent value={aprData?.aprSma} decimals="percent" />}
        />
        <InfoRow
          description={'TVL'}
          isLoading={isTVLLoading}
          info={
            <>
              <FormatToken amount={tvlETH} token="ETH" />
              &nbsp;(
              <FormatPrice amount={tvlUSD} currency="USD" />)
            </>
          }
        />
        {/*todo: add later*/}
        {/*{showMaxTVL && (*/}
        {/*  <InfoRow*/}
        {/*    description={'Maximum TVL'}*/}
        {/*    info={*/}
        {/*      <>*/}
        {/*        <FormatToken amount={maxTvlETH} symbol="ETH" />*/}
        {/*        &nbsp;(*/}
        {/*        <FormatPrice amount={msxTvlUSD} currency="USD" />)*/}
        {/*      </>*/}
        {/*    }*/}
        {/*  />*/}
        {/*)}*/}
        <InfoRow
          description={'Contract address'}
          isLoading={false}
          info={
            <AddressLinkEtherscan
              address={contractAddress}
              text={trimAddress(contractAddress, 3)}
            />
          }
        />
      </Flex>

      <VStack align="stretch" gap={6} pt={6}>
        <Text flex="1" fontSize="md" fontWeight="bold">
          Fees structure
        </Text>

        <InfoRow
          description={'Validation fee'}
          isLoading={isLoadingFees}
          info={`${feesData?.nodeOperatorFeeRatePercent}% of rewards`}
        />
        <InfoRow
          description={'Lido Infrastructure fee'}
          isLoading={isLoadingFees}
          info={`${feesData?.lidoInfrastructureFeeRatePercent}% of basis rewards* from the staked amount of ETH.`}
        />

        {showLiquidityFee && (
          <InfoRow
            description={'Lido Liquidity fee'}
            isLoading={isLoadingFees}
            info={`${feesData?.lidoLiquidityFeeRatePercent}% of basis rewards* from the amount of minted stETH.`}
          />
        )}

        <Text color={'fg.muted'} fontSize={'sm'} mt={3}>
          * Basis rewards are taken equal to Lido Core APR.
        </Text>
      </VStack>
    </VStack>
  );
};
