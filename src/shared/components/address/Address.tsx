import { ForwardedRef, forwardRef, HTMLAttributes } from 'react';
import styles from './Address.module.css';

export const trimAddress = (address: string, symbols: number): string => {
  if (symbols <= 0) return '';
  if (symbols * 2 >= address.length) return address;

  const left = address.slice(0, symbols);
  const right = address.slice(-symbols);

  return `${left}...${right}`;
};

export const Address = forwardRef<
  HTMLDivElement,
  {
    address: string;
    symbols?: number;
    'data-testid'?: string;
  } & HTMLAttributes<HTMLDivElement>
>(({ symbols = 3, address, ...rest }, ref?: ForwardedRef<HTMLDivElement>) => {
  return (
    <div {...rest} ref={ref} className={styles.address}>
      <span className={styles.full}>{address}</span>
      <span className={styles.trimmed}>{trimAddress(address, symbols)}</span>
    </div>
  );
});
