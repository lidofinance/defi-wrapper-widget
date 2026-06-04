import { lazy, Suspense } from 'react';
import invariant from 'tiny-invariant';
import { useStvStrategy } from '@/modules/defi-wrapper';
import { SplashScreen } from '@/shared/components/splash-screen';
import { WrapperLayout } from '@/shared/wrapper/layout';

const Loading = () => (
  <WrapperLayout>
    <SplashScreen isLoading />
  </WrapperLayout>
);

const EarnStrategy = lazy(() =>
  import('./lido-earn-strategy').then((mod) => ({
    default: mod.LidoEarnStrategy,
  })),
);

export const StvStrategyPool = () => {
  const { strategyId } = useStvStrategy();

  switch (strategyId) {
    case undefined:
      return <Loading />;
    case 'strategy.mellow.v1':
      return (
        <Suspense fallback={<Loading />}>
          <EarnStrategy />
        </Suspense>
      );
    case 'strategy.ggv.v1':
      // removed from render for lesser bundle size, but keeping the code for reference
      invariant(false, 'GGV strategy is deprecated');
    default:
      invariant(false, 'Unsupported strategy id ' + strategyId);
  }
};
