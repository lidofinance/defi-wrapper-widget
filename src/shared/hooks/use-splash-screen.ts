import { useEffect, useRef, useState } from 'react';
import { useIsFetching } from '@tanstack/react-query';
import { useDappStatus } from '@/modules/web3';
import { useDebouncedValue } from '@/shared/hooks';
import { useTimeout } from '@/shared/hooks/use-timeout';

const MIN_SPLASH_SCREEN_TIMEOUT = 500;
const FETCHING_DELAY = 200;

export const useSplashScreen = () => {
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const isFetching = useIsFetching();
  const { isSupportedChain, address } = useDappStatus();
  const previousAddressRef = useRef<string | undefined>(undefined);
  const firstLoadCompleted = useTimeout(MIN_SPLASH_SCREEN_TIMEOUT, false);
  const minTimeoutPassed = useTimeout(
    MIN_SPLASH_SCREEN_TIMEOUT,
    showSplashScreen,
  );
  const debouncedFetchFinished = useDebouncedValue(
    isFetching === 0,
    false,
    FETCHING_DELAY,
  );

  useEffect(() => {
    setShowSplashScreen((curr: boolean): boolean => {
      if (!curr) {
        return false;
      }

      const isLoaded = minTimeoutPassed && debouncedFetchFinished;
      return isSupportedChain && !isLoaded;
    });
  }, [minTimeoutPassed, debouncedFetchFinished, isSupportedChain]);

  useEffect(() => {
    const prevAddress = previousAddressRef.current;
    previousAddressRef.current = address;

    setShowSplashScreen((current) => {
      // min timeout has passed and still no wallet - wallet was not connected, hide splash, show skeletons
      if (firstLoadCompleted && !address) {
        return false;
      }

      // wallet was disconnected - hide splash
      if (prevAddress !== undefined && address === undefined) {
        return false;
      }

      // address was changed to a new one – no matter how – show splash
      const changeWorthResetting =
        address !== undefined && prevAddress !== address;
      if (changeWorthResetting) {
        return true;
      }
      return current;
    });
  }, [address, firstLoadCompleted]);

  return showSplashScreen;
};
