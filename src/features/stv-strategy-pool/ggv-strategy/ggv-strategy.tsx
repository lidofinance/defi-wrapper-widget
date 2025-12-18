import React from 'react';
import { Navigation, TAB } from '@/shared/wrapper/navigation';
import { Dashboard } from './dashboard';
import { Deposit } from './deposit';
import { useGGVStrategyPosition } from './hooks/use-ggv-strategy-position';
import { useStrategyWithdrawalRequestsRead } from './hooks/use-strategy-withdrawal-requests';
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

export const GGVStrategyPool = () => {
  const { totalValueInEth } = useGGVStrategyPosition();
  const { isEmpty } = useStrategyWithdrawalRequestsRead(true);

  const showDashboard = !!totalValueInEth || !isEmpty;

  return <Navigation tabs={TABS} showDashboard={showDashboard} />;
};
