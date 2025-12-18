import React, { useEffect, useMemo, useState } from 'react';
import { useDappStatus } from '@/modules/web3';
import { SplashScreen } from '@/shared/components/splash-screen';

import { TransactionModal } from '@/shared/components/transaction-modal/transaction-modal';
import { WhitelistedModal } from '@/shared/components/whitelisted-modal';
import { useSplashScreen } from '@/shared/hooks/use-splash-screen';
import { WrapperLayout } from '@/shared/wrapper/layout';
import { WidgetState, WidgetTabNavigation } from './widget-tab-navigation';

export type TAB = {
  label: string;
  value: WidgetState;
  component?: React.ComponentType;
};

type TabNavigatonProps = {
  tabs: TAB[];
  showDashboard?: boolean;
};

export const Navigation = ({
  tabs,
  showDashboard = true,
}: TabNavigatonProps) => {
  const { isWalletConnected } = useDappStatus();
  const [modePristine, setModePristine] = useState(true);
  const [mode, setMode] = useState<WidgetState>('dashboard');
  const showSplashScreen = useSplashScreen();
  const visibleTabs = useMemo(() => {
    return tabs.filter(
      (t) => t.value != 'dashboard' || (showDashboard && isWalletConnected),
    );
  }, [showDashboard, isWalletConnected, tabs]);

  const selectedTab = useMemo(() => {
    return visibleTabs.find((t) => t.value === mode);
  }, [mode, visibleTabs]);

  useEffect(() => {
    if (isWalletConnected) {
      if (mode === 'dashboard' && !showDashboard) {
        setMode(visibleTabs[0].value);
      }
    }
  }, [mode, visibleTabs, showDashboard, isWalletConnected]);

  useEffect(() => {
    setMode((current) => {
      if (current === 'dashboard' && !showDashboard) {
        return visibleTabs[0].value;
      }
      // if mode was changed manually, keep it
      if (!modePristine) {
        return current;
      }
      // force dashboard if we can show it
      if (showDashboard) {
        return 'dashboard';
      }

      return current;
    });
  }, [showDashboard, visibleTabs, modePristine]);

  return (
    <WrapperLayout>
      <SplashScreen isLoading={showSplashScreen}>
        <TransactionModal
          isDashboardAvailable={showDashboard}
          backToDashboard={() => setMode('dashboard')}
          onModalOpen={() => {
            setModePristine(false);
          }}
        >
          <WidgetTabNavigation
            mode={mode}
            mb={6}
            tabs={visibleTabs}
            onTabClick={(value: WidgetState) => {
              setMode(value);
              setModePristine(false);
            }}
          />
          {selectedTab?.component && <selectedTab.component />}
        </TransactionModal>
        <WhitelistedModal />
      </SplashScreen>
    </WrapperLayout>
  );
};
