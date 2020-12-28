import BaseError from './BaseError';

/**
 * Error signifying user will never have access to given resource
 *
 * @class
 * @extends BaseError
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403|403 Forbidden} for more information
 */
class ForbiddenResourceError extends BaseError {
  /**
   * Creates new error instance
   * @param {string} customMessage custom error message to display to user
   */
  constructor(customMessage = '') {
    super(customMessage || 'Resource access forbidden', 403);
  }
}

export default ForbiddenResourceError;
