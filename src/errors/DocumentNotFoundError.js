import BaseError from './BaseError';

/**
 * Error signifying document not found with specified parameters
 *
 * @class
 * @extends BaseError
 */
class DocumentNotFoundError extends BaseError {
  /**
   * Creates new error instance
   * @param {string} id id with no corresponding document
   * @param {string} info any additional information to include for human readability
   */
  constructor(id, info = '') {
    super(`Document with id "${id}" not found${info ? ` (${info})` : ''}`, 404);
    this.id = id;
    this.info = info;
  }
}

export default DocumentNotFoundError;
