import { useEffect, useState } from 'react';

export const useTimeout = (timeout: number, initialValue: boolean) => {
  const [timeoutPassed, setTimeoutPassed] = useState(initialValue);
  useEffect(() => {
    if (initialValue) {
      return;
    }
    const timer = setTimeout(() => {
      setTimeoutPassed(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [initialValue, timeout]);

  return timeoutPassed;
};
