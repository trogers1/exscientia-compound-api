'use strict';
const {
  connectToDatabase,
  formatBadRequestError,
  formatDatabaseError,
  formatInternalError,
  formatNotFoundError,
  formatValidationError,
  parseBody,
  validateLimitAndOffset
} = require('../utils');
const { Serializer } = require('../helpers/serializer');
const { Compound } = require('../models/Compound');

module.exports.main = async event => {
  try {
    let { limit, offset, ...badQueryParams } = validateLimitAndOffset(event.queryStringParameters);

    // Throw an error for any other query params since all we allow are limit and offset
    if (Object.keys(badQueryParams).length) {
      throw formatBadRequestError({
        message: `Unrecognized query string parameter(s): ${Object.keys(badQueryParams).join(', ')}`
      });
    }
    let query = Compound.find()
      .limit(limit)
      .skip(offset);

    let queryResult, numDocs;
    try {
      await connectToDatabase();
      [queryResult, numDocs] = await Promise.all([query, Compound.countDocuments()]);
    } catch (error) {
      throw formatDatabaseError(error);
    }

    queryResult = queryResult.map(item => item.toObject());
    let serializedResponse = Serializer.serialize('compound', queryResult, {
      total: numDocs
    });
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/vnd.api+json; charset=utf-8'
      },
      body: JSON.stringify(serializedResponse)
    };
  } catch (error) {
    return formatInternalError(error);
  }
};
