import BaseError from './BaseError';

class IncompleteRequestError extends BaseError {
  constructor(field, info = '') {
    super(`Field "${field}" not included in request${info ? ` (${info})` : ''}`, 400);
    this.field = field;
  }
}

export default IncompleteRequestError;
