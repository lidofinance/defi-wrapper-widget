import { useWrapperBalance, useRequests } from '@/modules/defi-wrapper';
import { Navigation, TAB } from '@/shared/wrapper/navigation';
import { Dashboard } from './dashboard';
import { Deposit } from './deposit';
import { Withdrawal } from './withdrawal';

const TABS: TAB[] = [
  { label: 'Dashboard', value: 'dashboard', component: Dashboard },
  { label: 'Deposit', value: 'deposit', component: Deposit },
  { label: 'Withdraw', value: 'withdraw', component: Withdrawal },
];

export const StvPool = () => {
  const { data: requests } = useRequests();
  const { assets } = useWrapperBalance();
  const showDashboard = !!assets || requests?.isEmpty === false;

  return <Navigation tabs={TABS} showDashboard={showDashboard} />;
};
