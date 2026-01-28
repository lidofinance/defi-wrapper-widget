export const aprToApy = (aprPercent: number) => {
  const apr = aprPercent / 100;
  return (Math.pow(1 + apr / 365, 365) - 1) * 100;
};
