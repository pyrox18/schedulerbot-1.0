const responseCodes = Object.freeze({
  SUCCESS: 0,
  ERROR: 1,
  DB_ERROR: 2,
  UNAUTHORIZED: -1,
  INVALID: -2
});

class Response {
  constructor(code, message, meta) {
    this.code = code;
    this.message = message;
    this.meta = meta;
  }

  static get responseCodes() {
    return responseCodes;
  }

  static success(meta = {}) {
    return new this(this.responseCodes.SUCCESS, null, meta);
  }

  static error(message, meta = {}) {
    return new this(this.responseCodes.ERROR, message, meta);
  }

  static dbError(message, meta = {}) {
    return new this(this.responseCodes.DB_ERROR, message, meta);
  }

  static unauthorized() {
    return new this(this.responseCodes.UNAUTHORIZED, null, null);
  }

  static invalid(meta = {}) {
    return new this(this.responseCodes.INVALID, null, meta);
  }

  success() {
    return this.code == responseCodes.SUCCESS;
  }

  error() {
    return (this.code == responseCodes.ERROR || this.code == responseCodes.DB_ERROR);
  }

  unauthorized() {
    return this.code == responseCodes.UNAUTHORIZED;
  }

  invalid() {
    return this.code == responseCodes.INVALID;
  }
}

module.exports = Response;