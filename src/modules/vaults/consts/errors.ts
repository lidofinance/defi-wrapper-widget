export class DisplayableError extends Error {
  public originalError?: Error;
  public isRetryable: boolean;

  constructor(message: string, isRetryable = true, originalError?: Error) {
    super(message);
    this.name = 'GenericDisplayableError';
    this.originalError = originalError;
    this.isRetryable = isRetryable;
  }

  public originalErrorString(): string {
    return this.originalError ? this.originalError.toString() : '';
  }
}

// Vault Fetch

export class VaultAddressError extends DisplayableError {
  constructor() {
    super('Vault address is invalid', false);
    this.name = 'VaultAddressError';
  }
}

export class VaultOwnerNotDashboardError extends DisplayableError {
  constructor() {
    super('Vault owner is not the dashboard', false);
    this.name = 'VaultNotDashboard';
  }
}

export class ReportMissingError extends DisplayableError {
  constructor() {
    super('Vault Report is missing', false);
    this.name = 'ReportMissing';
  }
}
