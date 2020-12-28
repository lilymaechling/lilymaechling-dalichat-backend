import BaseError from './BaseError';

class UniqueFieldError extends BaseError {
  constructor(field, value) {
    super(`Field "${field}" with value "${value}" already exists`, 409);
  }
}

export default UniqueFieldError;
