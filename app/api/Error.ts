class ErrorApi extends Error {
    status: number;
    code?: string;
    context?: unknown;
  
    constructor(message: string, status: number, code?: string, context?: unknown) {
      super(message);
      this.status = status;
      this.code = code;
      this.context = context;
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  
    toJSON() {
      return {
        error: this.message,
        status: this.status,
        name: this.name,
        code: this.code,
        context: this.context,
      };
    }
  }
  
  // Errores generales HTTP
  class ErrorNotFound extends ErrorApi {
    constructor(message: string, context?: unknown) {
      super(message, 404, "NOT_FOUND", context);
    }
  }
  
  class ErrorUnauthorized extends ErrorApi {
    constructor(message: string, context?: unknown) {
      super(message, 401, "UNAUTHORIZED", context);
    }
  }
  
  class ErrorForbidden extends ErrorApi {
    constructor(message: string, context?: unknown) {
      super(message, 403, "FORBIDDEN", context);
    }
  }
  
  class ErrorBadRequest extends ErrorApi {
    constructor(message: string, context?: unknown) {
      super(message, 400, "BAD_REQUEST", context);
    }
  }
  
  class ErrorInternalServer extends ErrorApi {
    constructor(message: string, context?: unknown) {
      super(message, 500, "INTERNAL_SERVER_ERROR", context);
    }
  }
  
  class ErrorNotImplemented extends ErrorApi {
    constructor(message: string, context?: unknown) {
      super(message, 501, "NOT_IMPLEMENTED", context);
    }
  }
  
  // Errores específicos de QR
  class ErrorQrCodeNotFound extends ErrorApi {
    constructor(message: string, context?: unknown) {
      super(message, 404, "QR_CODE_NOT_FOUND", context);
    }
  }
  
  class ErrorQrTokenNotFound extends ErrorApi {
    constructor(message: string, context?: unknown) {
      super(message, 404, "QR_TOKEN_NOT_FOUND", context);
    }
  }
  
  class ErrorQrScanned extends ErrorApi {
    constructor(message: string, context?: unknown) {
      super(message, 400, "QR_ALREADY_SCANNED", context);
    }
  }
  
  class ErrorQrExpired extends ErrorApi {
    constructor(message: string, context?: unknown) {
      super(message, 403, "QR_EXPIRED", context);
    }
  }
  
  export {
    ErrorApi,
    ErrorNotFound,
    ErrorUnauthorized,
    ErrorForbidden,
    ErrorBadRequest,
    ErrorInternalServer,
    ErrorNotImplemented,
    ErrorQrCodeNotFound,
    ErrorQrTokenNotFound,
    ErrorQrScanned,
    ErrorQrExpired,
  };
  