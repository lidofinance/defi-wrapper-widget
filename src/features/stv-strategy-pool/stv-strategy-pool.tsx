import invariant from 'tiny-invariant';
import { useStvStrategy } from '@/modules/defi-wrapper';
import { SplashScreen } from '@/shared/components/splash-screen';
import { WrapperLayout } from '@/shared/wrapper/layout';

// GGV strategy is deprecated and only used as an reference
//import { GGVStrategyPool } from './ggv-strategy';

import { LidoEarnStrategy } from './lido-earn-strategy';

export const StvStrategyPool = () => {
  const { strategyId } = useStvStrategy();

  switch (strategyId) {
    case undefined:
      return (
        <WrapperLayout>
          <SplashScreen isLoading />
        </WrapperLayout>
      );
    case 'strategy.mellow.v1':
      return <LidoEarnStrategy />;
    case 'strategy.ggv.v1':
      // removed from render for lesser bundle size, but keeping the code for reference
      invariant(false, 'GGV strategy is deprecated');
    default:
      invariant(false, 'Unsupported strategy id ' + strategyId);
  }
};
