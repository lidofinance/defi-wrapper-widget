import { useEffect } from 'react';
import { Path, PathValue, UseFormSetValue } from 'react-hook-form';

type UseQueryParamsReferralFormArgs<T extends { referral: string | null }> = {
  setValue: UseFormSetValue<T>;
};

const getQuery = () => {
  if (typeof window !== 'undefined') {
    return new URLSearchParams(window.location.search);
  }
  return new URLSearchParams();
};

export const getQueryStringVal = (key: string): string | null => {
  return getQuery().get(key);
};

export const useQueryParamsReferralForm = <
  T extends { referral: string | null },
>({
  setValue,
}: UseQueryParamsReferralFormArgs<T>) => {
  const ref = getQueryStringVal('ref');

  useEffect(() => {
    try {
      if (typeof ref === 'string') {
        setValue('referral' as Path<T>, ref as PathValue<T, Path<T>>);
      }
    } catch (error) {
      console.warn('Error setting referral value from query params', error);
    }
  }, [ref, setValue]);
};
