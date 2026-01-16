import { useVaultCapacity } from '@/modules/defi-wrapper';
import { useEthUsd } from '@/modules/web3';
import { InfoRow } from '@/shared/components/info-row';
import { FormatToken, FormatPrice } from '@/shared/formatters';

export const MaxTvlRow = () => {
  const { data, isLoading } = useVaultCapacity();
  const { usdAmount, isLoading: isLoadingUsdPrice } = useEthUsd(
    data?.totalDepositCapacityEth,
  );
  return (
    <InfoRow
      description={'Maximum TVL'}
      isLoading={isLoading || isLoadingUsdPrice}
      info={
        <>
          <FormatToken amount={data?.totalDepositCapacityEth} token="ETH" />
          &nbsp; (<FormatPrice amount={usdAmount} currency="USD" />)
        </>
      }
    />
  );
};
