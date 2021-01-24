import BaseError from './BaseError';

/**
 * Error signifying that an invalid value was passed to a given field
 *
 * @class
 * @extends BaseError
 */
class FieldValidationError extends BaseError {
  /**
   * Creates new error instance
   * @param {string} field field to which invalid value was passed
   * @param {string} info additional information to clarify error to human reader
   */
  constructor(field, info = '') {
    super(`Invalid value at field "${field}"${info ? ` (${info})` : ''}`, 400);
  }
}

export default FieldValidationError;
