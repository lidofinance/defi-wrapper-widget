import { useCallback } from 'react';

export const useURLParams = () => {
  return useCallback((key: string): string => {
    const params = new URLSearchParams(window.location.search);
    return params.get(key) || '';
  }, []);
};
