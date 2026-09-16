export function getErrorInfo(error: unknown): {
  message: string;
  cause: unknown;
} {
  if (error instanceof Error) {
    return {
      message: error.message,
      cause: error.cause ?? error,
    };
  }

  return {
    message: String(error),
    cause: error,
  };
}
