export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND_ERROR: "NOT_FOUND_ERROR",
  CONFLICT_ERROR: "CONFLICT_ERROR",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR"
};


export abstract class AppError extends Error {
  abstract readonly code: string;
}

export class ValidationError extends AppError {
  readonly code = ERROR_CODES.VALIDATION_ERROR;
  constructor(
    message: string,
    public errors: Record<string, string>
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  readonly code = ERROR_CODES.NOT_FOUND_ERROR;
  constructor(resource: string) {
    super(`${resource} not found`);
  }
}

export class ConflictError extends AppError {
  readonly code = ERROR_CODES.CONFLICT_ERROR;
  constructor(
    message: string,
    public errors: Record<string, string>
  ) {
    super(message);
  }
}

export class InternalServerError extends AppError {
  readonly code = ERROR_CODES.INTERNAL_SERVER_ERROR;
  constructor(message: string) {
    super(`Internal server error: ${message}`);
  }
}

export function errorToProblemDetails(error: AppError) {
  switch (error.code) {
    case ERROR_CODES.VALIDATION_ERROR:
      return {
        type: ERROR_CODES.VALIDATION_ERROR,
        status: 400,
        title: "Validation Error",
        detail: error.message,
        errors: (error as ValidationError).errors
      };
    case ERROR_CODES.NOT_FOUND_ERROR:
      return {
        type: ERROR_CODES.NOT_FOUND_ERROR,
        status: 404,
        title: "Not Found",
        detail: error.message
      };
    case ERROR_CODES.CONFLICT_ERROR:
      return {
        type: ERROR_CODES.CONFLICT_ERROR,
        status: 409,
        title: "Conflict",
        detail: error.message,
        errors: (error as ConflictError).errors
      };
    case ERROR_CODES.INTERNAL_SERVER_ERROR:
      return {
        type: ERROR_CODES.INTERNAL_SERVER_ERROR,
        status: 500,
        title: "Internal Server Error",
        detail: error.message
      };
    default:
      return {
        type: "UNKNOWN_ERROR",
        status: 500,
        title: "Unknown Error",
        detail: error.message
      };
  }
}