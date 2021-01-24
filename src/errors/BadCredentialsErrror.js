import BaseError from './BaseError';

/**
 * Error signifying incorrect credentials were included with request
 *
 * @class
 * @extends BaseError
 */
class BadCredentialsError extends BaseError {
  /**
   * Creates new error instance
   * @param {string} customMessage optional error message to include with the error
   */
  constructor(customMessage = '') {
    super(customMessage || 'Invalid credentials', 401);
  }
}

export default BadCredentialsError;
