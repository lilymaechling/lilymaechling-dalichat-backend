// Reference: https://javascript.info/custom-errors
class BaseError extends Error {
  constructor(message, code) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

export default BaseError;
