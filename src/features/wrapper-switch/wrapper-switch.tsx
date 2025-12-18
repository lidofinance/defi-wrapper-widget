import { lazy } from 'react';
import invariant from 'tiny-invariant';

import { useDefiWrapper } from '@/modules/defi-wrapper';

const StvPool = lazy(() =>
  import('../stv-pool').then((module) => ({ default: module.StvPool })),
);

const StvStethPool = lazy(() =>
  import('../stv-steth-pool').then((module) => ({
    default: module.StvStethPool,
  })),
);

const StvStrategyPool = lazy(() =>
  import('../stv-strategy-pool/stv-strategy-pool').then((module) => ({
    default: module.StvStrategyPool,
  })),
);

export const WrapperSwitch = () => {
  const { wrapperType } = useDefiWrapper();
  switch (wrapperType) {
    case 'StvPool':
      return <StvPool />;
    case 'StvStETHPool':
      return <StvStethPool />;
    case 'StvStrategyPool':
      return <StvStrategyPool />;
    default:
      invariant(false, 'Unknown wrapper type');
      return null;
  }
};
