import { useMaxWrapperTvl } from '@/modules/defi-wrapper';
import { InfoRow } from '@/shared/components/info-row';
import { FormatToken, FormatPrice } from '@/shared/formatters';

export const MaxTvlRow = () => {
  const {
    maxTvlETH,
    maxTvlUSD,
    isLoading: isLoadingMaxTvl,
  } = useMaxWrapperTvl();
  return (
    <InfoRow
      description={'Maximum TVL'}
      isLoading={isLoadingMaxTvl}
      info={
        <>
          <FormatToken amount={maxTvlETH} token="ETH" />
          &nbsp; (<FormatPrice amount={maxTvlUSD} currency="USD" />)
        </>
      }
    />
  );
};
