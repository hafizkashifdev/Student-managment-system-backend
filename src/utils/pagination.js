/**
 * Parse pagination query params with defaults.
 * @param {object} query - Express req.query
 * @returns {{ page: number, limit: number, skip: number, sort: object }}
 */
export function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;

  const sortField = query.sortBy || 'createdAt';
  const sortOrder = query.order === 'asc' ? 1 : -1;
  const sort = { [sortField]: sortOrder };

  return { page, limit, skip, sort };
}

/**
 * Build a standard pagination metadata object.
 * @param {number} total
 * @param {number} page
 * @param {number} limit
 * @returns {object}
 */
export function buildPaginationMeta(total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
