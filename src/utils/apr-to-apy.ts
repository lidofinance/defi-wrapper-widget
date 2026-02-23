export const aprToApy = (aprPercent: number) => {
  const apr = aprPercent / 100;
  return (Math.pow(1 + apr / 365, 365) - 1) * 100;
};

export const apyToApr = (apyPercent: number) => {
  const apy = apyPercent / 100;
  return (Math.pow(1 + apy, 1 / 365) - 1) * 100;
};
