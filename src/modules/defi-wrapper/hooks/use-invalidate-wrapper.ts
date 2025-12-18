import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useVault } from '@/modules/vaults';

export const useInvalidateWrapper = () => {
  const { invalidateVaultState } = useVault();
  const queryClient = useQueryClient();

  return useCallback(() => {
    const options = { cancelRefetch: true, throwOnError: false };

    return Promise.all([
      queryClient.refetchQueries({ queryKey: ['wrapper'] }, options),
      invalidateVaultState(),
    ]);
  }, [invalidateVaultState, queryClient]);
};
