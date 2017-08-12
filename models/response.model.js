class Response {
  static code = Object.freeze({
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
    return new this(this.code.SUCCESS, null, meta);
  }

  static error(message, meta) {
    return new this(this.code.ERROR, message, meta);
  }

  static dbError(message, meta) {
    return new this(this.code.DB_ERROR, message, meta);
  }

  static unauthorized() {
    return new this(this.code.UNAUTHORIZED, null, null);
  }
}