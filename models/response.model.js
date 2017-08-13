class Response {
  static responseCodes = Object.freeze({
    SUCCESS: 0,
    ERROR: 1,
    DB_ERROR: 2,
    UNAUTHORIZED: -1
  });

  constructor(code, message, meta) {
    this.code = code;
    this.message = message;
    this.meta = meta;
  }

  static success(meta) {
    return new this(this.responseCodes.SUCCESS, null, meta);
  }

  static error(message, meta) {
    return new this(this.responseCodes.ERROR, message, meta);
  }

  static dbError(message, meta) {
    return new this(this.responseCodes.DB_ERROR, message, meta);
  }

  static unauthorized() {
    return new this(this.responseCodes.UNAUTHORIZED, null, null);
  }

  success() {
    return this.code == this.responseCodes.SUCCESS;
  }

  error() {
    return (this.code == this.responseCodes.ERROR || this.code == this.responseCodes.DB_ERROR);
  }

  unauthorized() {
    return this.code == this.responseCodes.UNAUTHORIZED;
  }
}

module.exports = Response;