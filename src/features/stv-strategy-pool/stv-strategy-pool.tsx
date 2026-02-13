import invariant from 'tiny-invariant';
import { useStvStrategy } from '@/modules/defi-wrapper';
import { SplashScreen } from '@/shared/components/splash-screen';
import { WrapperLayout } from '@/shared/wrapper/layout';

import { GGVStrategyPool } from './ggv-strategy';
import { LidoEarnStrategy } from './lido-earn-strategy';

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
    case 'strategy.mellow.v1':
      return <LidoEarnStrategy />;
    default:
      invariant(false, 'Unsupported strategy id ' + strategyId);
  }
};
