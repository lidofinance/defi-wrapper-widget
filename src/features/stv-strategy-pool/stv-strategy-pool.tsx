import invariant from 'tiny-invariant';
import { useStvStrategy } from '@/modules/defi-wrapper';
import { SplashScreen } from '@/shared/components/splash-screen';
import { WrapperLayout } from '@/shared/wrapper/layout';
import { GGVStrategyPool } from './ggv-strategy';

export const StvStrategyPool = () => {
  const { strategyId } = useStvStrategy();

  switch (strategyId) {
    case undefined:
      return (
        <WrapperLayout>
          <SplashScreen isLoading={true} />
        </WrapperLayout>
      );
    case 'strategy.ggv.v1':
      return <GGVStrategyPool />;
    default:
      invariant(false, 'Unsupported strategy id ' + strategyId);
  }
};
