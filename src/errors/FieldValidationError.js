import BaseError from './BaseError';

class FieldValidationError extends BaseError {
  constructor(field, info = '') {
    super(`Invalid value at field "${field}"${info ? ` (${info})` : ''}`);
  }
}

export default FieldValidationError;
