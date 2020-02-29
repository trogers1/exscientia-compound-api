const { formatBadRequestError } = require('./formatBadRequestError');

/**
 * @param {Object} params - Query parameters used on a request
 * @returns {Object} - Return validated limit and offset params, and everything else
 */

module.exports.validateLimitAndOffset = params => {
  if (!params) {
    throw formatBadRequestError({
      message:
        "The 'limit' query parameter is required and must be a positive integer no greater than 100"
    });
  }

  let { limit, offset, ...rest } = params;

  limit = Number(limit);
  if (!limit || limit > 100 || limit < 1) {
    throw formatBadRequestError({
      message:
        "The 'limit' query parameter is required and must be a positive integer no greater than 100"
    });
  }

  if (!offset || offset === '0') {
    offset = 0;
  } else if (!Number(offset) || offset < 0) {
    throw formatBadRequestError({
      message: "The 'offset' query parameter must be a positive integer or zero"
    });
  }
  offset = Number(offset);

  return {
    limit,
    offset,
    ...rest
  };
};
