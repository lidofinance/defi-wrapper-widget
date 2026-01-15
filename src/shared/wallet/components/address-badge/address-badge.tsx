import { CSSProperties, forwardRef, type MouseEvent, useRef } from 'react';
import { zeroAddress } from 'viem';
import clsx from 'clsx';
import { Flex, Skeleton } from '@chakra-ui/react';
import { Address } from '@/shared/components/address';
import { Identicon } from '@/shared/components/identicon';
import { useSafeEnsName } from '@/shared/hooks/use-safe-ens-name';
import { addressSchema } from '@/utils/validate-form-value';
import { AddressAvatar } from './address-avatar';
import styles from './address-badge.module.css';

export type AddressBadgeProps = {
  // display
  address?: string;
  showEnsName?: boolean;
  showPopover?: boolean | 'default' | 'hover';
  // state
  isLoading?: boolean;
  // style
  symbols?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  hoverEffect?: boolean;
  bgColor?: 'transparent' | 'default' | 'error' | 'success' | 'active';
  crossed?: boolean;
  'data-testid'?: string;
} & Omit<React.ComponentPropsWithRef<'div'>, 'color' | 'size'>;

export const AddressBadge = forwardRef<HTMLDivElement, AddressBadgeProps>(
  (
    {
      symbols = 5,
      size = 'xs',
      bgColor = 'default',
      crossed = false,
      isLoading = false,
      showPopover,
      showEnsName = false,
      ...props
    },
    forwardedRef,
  ) => {
    const backupRef = useRef<HTMLDivElement>(null);
    const ref = forwardedRef || backupRef;
    const parsing = addressSchema.safeParse(props.address);

    const { ensName, isLoading: isEnsLoading } = useSafeEnsName(
      parsing.success && showEnsName ? parsing.data : undefined,
    );

    const onClick = (event: MouseEvent<HTMLDivElement>) => {
      props.onClick?.(event);
    };

    const address = parsing['data'];

    const pillClassName = clsx(
      styles.pillContainer,
      bgColor &&
        bgColor !== 'default' &&
        styles[
          `pillContainer${bgColor.charAt(0).toUpperCase() + bgColor.slice(1)}`
        ],
    );

    if (isLoading || (showEnsName && isEnsLoading)) {
      return (
        <Flex
          alignItems="center"
          gap={2}
          className={pillClassName}
          onClick={onClick}
          role="button"
          tabIndex={0}
          onKeyDown={() => {}}
          ref={ref}
          {...props}
        >
          {/* if ens forced loading we can show right identicon */}
          <Identicon address={address ?? zeroAddress} />
          <Skeleton
            flex="1"
            height="4"
            variant="pulse"
            style={{ display: 'inline-block', width: 113 }}
          />
        </Flex>
      );
    }

    if (!parsing.success) return null;

    const mainText = showEnsName && ensName ? ensName : address;

    return (
      <Flex
        ref={ref}
        alignItems="center"
        gap={2}
        className={pillClassName}
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={() => {}}
        {...props}
      >
        <AddressAvatar address={address} ensName={ensName} />
        <Address
          className={clsx(
            styles.addressText,
            styles[`addressText${size.toUpperCase()}`],
            crossed && styles.addressTextCrossed,
          )}
          style={
            {
              fontWeight: 'var(--chakra-font-weights-semibold)',
              color: `var(--chakra-colors-gray-800)`,
            } as CSSProperties
          }
          address={mainText ?? ''}
          symbols={symbols}
          data-testid={
            props['data-testid'] ? `${props['data-testid']}Text` : undefined
          }
        />
      </Flex>
    );
  },
);
