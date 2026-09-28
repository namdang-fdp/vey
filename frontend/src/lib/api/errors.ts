export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiNetworkError extends Error {
  constructor(message = "Network request failed.") {
    super(message);
    this.name = "ApiNetworkError";
  }
}
export class ApiConfigurationError extends Error {
  constructor() {
    super("API base URL is not configured.");
    this.name = "ApiConfigurationError";
  }
}
