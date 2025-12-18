interface TruncateAddressArgs {
  address: string;
  startLength?: number;
  endLength?: number;
}

export const truncateAddress = (payload: TruncateAddressArgs) => {
  const { address, startLength = 6, endLength = 6 } = payload;
  if (!address) return '';

  if (address.length <= startLength + endLength) return address;

  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};
