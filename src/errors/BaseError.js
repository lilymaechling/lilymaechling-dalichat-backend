/**
 * Base error class with support for custom error name and code fields
 *
 * @class
 * @extends Error
 * @see {@link https://javascript.info/custom-errors|this link} for more information
 */
class BaseError extends Error {
  /**
   * Saves custom variables and instantiates base "Error" class
   * @param {string} message error message to pass to superclass
   * @param {number} code http error code to save with error
   */
  constructor(message, code) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

export default BaseError;
