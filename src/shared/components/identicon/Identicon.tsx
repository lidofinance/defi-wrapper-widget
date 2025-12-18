import { CSSProperties, ForwardedRef, forwardRef } from 'react';
import _Jazzicon from 'react-jazzicon';
import styles from './Identicon.module.css';

// There is an error with importing jsNumberForAddress from 'react-jazzicon' as named export in ESM build
// Since the implementation is tiny, moving it here
const jsNumberForAddress = (address: string): number => {
  const addr = address.slice(2, 10);
  return parseInt(addr, 16); // seed
};

//@ts-expect-error Property default doesn't exist on type
const Jazzicon = _Jazzicon.default || _Jazzicon;

export const Identicon = forwardRef<
  HTMLDivElement,
  {
    address: string;
    diameter?: number;
    paperStyles?: CSSProperties;
    svgStyles?: CSSProperties;
  }
>(
  (
    { diameter = 24, address, paperStyles, svgStyles, ...rest },
    ref?: ForwardedRef<HTMLDivElement>,
  ) => {
    return (
      <div {...rest} ref={ref} className={styles.identicon} style={paperStyles}>
        <Jazzicon
          seed={jsNumberForAddress(address)}
          diameter={diameter}
          style={svgStyles}
        />
      </div>
    );
  },
);
