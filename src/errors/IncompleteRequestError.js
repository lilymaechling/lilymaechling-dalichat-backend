import BaseError from './BaseError';

class IncompleteRequestError extends BaseError {
  constructor(field) {
    super(`Field "${field}" not included in request`, 400);
    this.field = field;
  }
}

export default IncompleteRequestError;
