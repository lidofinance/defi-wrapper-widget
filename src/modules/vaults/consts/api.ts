export type VaultsParams = {
  limit: number;
  offset: number;
  sortBy?: string;
  direction?: string;
  role?: string;
  address?: string;
};

export const vaultApiRoutes = {
  vaults: (basePath: string, params: VaultsParams) => {
    const { limit, offset, sortBy, direction, role, address } = params;
    const queryParams = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      ...(sortBy && { sortBy }),
      ...(direction && { direction: direction.toUpperCase() }),
      ...(role && { role }),
      ...(address && { address }),
    });
    return `${basePath}/v1/vaults?${queryParams.toString()}`;
  },
  vaultMetrics: (basePath: string, vaultAddress: string) =>
    `${basePath}/v1/vaults/${vaultAddress}/latest-metrics`,
  vaultReport: (basePath: string, vaultAddress: string, cid: string) =>
    `${basePath}/v1/report/${cid}/${vaultAddress}`,
  vaultAprSma: (basePath: string, vaultAddress: string) =>
    `${basePath}/v1/vaults/${vaultAddress}/apr/sma`,
};
