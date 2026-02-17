import React from 'react';
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

export const LidoEarnStrategy = () => {
  const { totalUserValueInEth } = useEarnPosition();
  const { isEmpty } = useStrategyWithdrawalRequestsRead(true);

  const showDashboard = !isEmpty || !!totalUserValueInEth;

  return <Navigation tabs={TABS} showDashboard={showDashboard} />;
};
