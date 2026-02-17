import React from 'react';
import { Navigation, TAB } from '@/shared/wrapper/navigation';

// import { Withdrawal } from './withdrawal';
import { Dashboard } from './dashboard';
import { Deposit } from './deposit';
import { useEarnPosition } from './hooks/use-earn-position';

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
  // {
  //   label: 'Withdraw',
  //   value: 'withdraw',
  //   component: Withdrawal,
  // },
];

export const LidoEarnStrategy = () => {
  const { totalUserValueInEth } = useEarnPosition();
  // const { isEmpty } = useStrategyWithdrawalRequestsRead(true);

  const showDashboard = !!totalUserValueInEth;

  return <Navigation tabs={TABS} showDashboard={showDashboard} />;
};
