import { lazy, Suspense } from 'react';
import { USER_CONFIG } from '@/config';
import { Navigation, TAB } from '@/shared/wrapper/navigation';

import { Dashboard } from './dashboard';
import { Deposit } from './deposit';
import { useEarnPosition, useStrategyWithdrawalRequestsRead } from './hooks';
import { Withdrawal } from './withdrawal';

const TABS: TAB[] = [
  {
    label: 'Dashboard',
    value: 'dashboard',
    component: Dashboard,
  },
  {
    label: 'Deposit',
    value: 'deposit',
    component: Deposit,
  },
  {
    label: 'Withdraw',
    value: 'withdraw',
    component: Withdrawal,
  },
];

// This components gets tree-shaken in production builds
const DebugComponent = () => {
  if (!USER_CONFIG.isDev) return null;

  const Component = lazy(() =>
    import('./debug-view/index').then((mod) => ({ default: mod.DebugView })),
  );
  return (
    <Suspense fallback={null}>
      <Component />
    </Suspense>
  );
};

export const LidoEarnStrategy = () => {
  const { positionData } = useEarnPosition();
  const { isEmpty } = useStrategyWithdrawalRequestsRead(true);

  const showDashboard = !isEmpty || !!positionData?.totalUserValueInEth;

  return (
    <>
      <Navigation tabs={TABS} showDashboard={showDashboard} />
      <DebugComponent />
    </>
  );
};
