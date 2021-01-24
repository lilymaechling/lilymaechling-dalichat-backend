import BaseError from './BaseError';

/**
 * Error signifying a passed value conflicts with an existing unique field value
 *
 * @class
 * @extends BaseError
 */
class UniqueFieldError extends BaseError {
  /**
   * Creates new error instance
   * @param {string} field name of field with conflict
   * @param {string} value passed value causing conflict
   */
  constructor(field, value) {
    super(`Field "${field}" with value "${value}" already exists`, 409);
  }
}

export default UniqueFieldError;
