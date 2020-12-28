import BaseError from './BaseError';

/**
 * Error signifying a request is missing required fields
 *
 * @class
 * @extends BaseError
 */
class IncompleteRequestError extends BaseError {
  /**
   * Creates new error instance
   * @param {string} field field not included in request
   * @param {string} info additional information to clarify error
   */
  constructor(field, info = '') {
    super(`Field "${field}" not included in request${info ? ` (${info})` : ''}`, 400);
    this.field = field;
  }
}

export default IncompleteRequestError;
