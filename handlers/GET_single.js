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
    let { id } = event.pathParameters;

    if (event.queryStringParameters) {
      throw formatBadRequestError({
        message: `Unrecognized query string parameter(s): ${Object.keys(badQueryParams).join(', ')}`
      });
    }
    let query = Compound.find({ compound_id: id });

    let queryResult;
    try {
      await connectToDatabase();
      queryResult = await query;
      console.log(queryResult);
    } catch (error) {
      throw formatDatabaseError(error);
    }
    if (!queryResult.length) {
      throw formatNotFoundError({ message: id });
    }
    queryResult = queryResult[0].toObject();
    let serializedResponse = Serializer.serialize('compound', queryResult);

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
