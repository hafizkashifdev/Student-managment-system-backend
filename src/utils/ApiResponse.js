/**
 * Standard API success response wrapper.
 */
export class ApiResponse {
  /**
   * @param {number} statusCode
   * @param {*} data
   * @param {string} message
   * @param {object} [pagination]
   */
  constructor(statusCode, data, message = 'Success', pagination = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (pagination) this.pagination = pagination;
  }
}
