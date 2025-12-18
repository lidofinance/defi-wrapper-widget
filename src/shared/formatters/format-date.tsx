import { Skeleton, TextProps } from '@chakra-ui/react';
import { USER_CONFIG } from '@/config';

type FormatDateProps = {
  date?: Date;
  fallback?: string;
  type: 'date' | 'time' | 'datetime';
  isLoading?: boolean;
  options?: Intl.DateTimeFormatOptions;
};

const getDefaultOptions = (
  type: FormatDateProps['type'],
): Intl.DateTimeFormatOptions => {
  switch (type) {
    case 'date':
      return {
        dateStyle: 'medium',
      } as const;
    case 'time':
      return { hour: 'numeric', minute: 'numeric' } as const;
    case 'datetime':
      return {
        dateStyle: 'medium',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      } as const;
  }
};

export const FormatDate = ({
  date,
  options,
  type,
  fallback = 'N/A',
  isLoading = false,
  ...rest
}: FormatDateProps & TextProps) => {
  return (
    <Skeleton
      as={'span'}
      loading={isLoading}
      display={'inline-block'}
      {...rest}
    >
      {date?.toLocaleDateString(USER_CONFIG.LOCALE, {
        ...getDefaultOptions(type),
        ...options,
      }) ?? fallback}
    </Skeleton>
  );
};
