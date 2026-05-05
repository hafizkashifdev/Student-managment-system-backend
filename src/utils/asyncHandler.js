/**
 * Wraps an async Express route handler to forward errors to next().
 * @param {Function} fn - Async route handler (req, res, next)
 * @returns {Function}
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
