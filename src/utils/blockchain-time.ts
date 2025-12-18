export const fromBlockChainTime = (blockchainTime: bigint) => {
  return new Date(Number(blockchainTime) * 1000);
};

export const toBlockChainTime = (date: Date) => {
  return BigInt(Math.floor(date.getTime() / 1000));
};
