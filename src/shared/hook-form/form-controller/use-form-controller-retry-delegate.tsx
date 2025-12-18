import { useCallback, useMemo } from 'react';
import { EventSubscription } from './event-subscription';

export const useFormControllerRetry = () => {
  const retryEvent = useMemo(() => new EventSubscription(), []);

  const retryFire = useCallback(() => {
    retryEvent.fire();
  }, [retryEvent]);

  return {
    retryFire,
    retryEvent,
  };
};
