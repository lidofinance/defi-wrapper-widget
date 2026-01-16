import type { TAB } from '@/shared/wrapper/navigation';
import { SimplePoolNavigation } from '@/shared/wrapper/simple-pool-navigation';
import { Dashboard } from './dashboard';
import { Deposit } from './deposit';
import { Withdrawal } from './withdrawal';

const TABS: TAB[] = [
  { label: 'Dashboard', value: 'dashboard', component: Dashboard },
  { label: 'Deposit', value: 'deposit', component: Deposit },
  { label: 'Withdraw', value: 'withdraw', component: Withdrawal },
];

export const StvPool = () => {
  return <SimplePoolNavigation tabs={TABS} />;
};
