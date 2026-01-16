import { ComponentProps, FC } from 'react';

import { USER_CONFIG } from '@/config';
import { DATA_UNAVAILABLE } from '@/consts/text';
import { Tooltip } from '@/shared/components/tooltip/tooltip';

export type FormatPriceComponent = FC<
  ComponentProps<'span'> & {
    amount: number | null | undefined;
    currency?: string;
  }
>;

export const FormatPrice: FormatPriceComponent = (props) => {
  const { amount, currency = 'USD', ...rest } = props;
  const actual =
    amount == null
      ? DATA_UNAVAILABLE
      : amount.toLocaleString(USER_CONFIG.LOCALE, {
          style: 'currency',
          currency,
        });

  if (amount && amount < 0.01) {
    return (
      <Tooltip
        positioning={{ placement: 'right-start' }}
        content={
          <span>
            {amount.toLocaleString(USER_CONFIG.LOCALE, {
              style: 'currency',
              currency,
              maximumFractionDigits: 10,
            })}
          </span>
        }
      >
        <span {...rest}>{actual}</span>
      </Tooltip>
    );
  }

  return <span {...rest}>{actual}</span>;
};
