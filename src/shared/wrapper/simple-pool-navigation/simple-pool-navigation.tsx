import React from 'react';
import { useRequests, useWrapperBalance } from '@/modules/defi-wrapper';
import { Navigation, TAB } from '@/shared/wrapper/navigation';

export type SimplePoolNavigationProps = {
  tabs: TAB[];
};

export const SimplePoolNavigation: React.FC<SimplePoolNavigationProps> = ({
  tabs,
}) => {
  const { data: requests } = useRequests();
  const { assets } = useWrapperBalance();

  const showDashboard = !!assets || requests?.isEmpty === false;

  return <Navigation tabs={tabs} showDashboard={showDashboard} />;
};
