'use strict';
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });
const {
  connectToDatabase,
  formatBadRequestError,
  formatDatabaseError,
  formatInternalError,
  formatNotFoundError,
  formatValidationError,
  parseBody
} = require('../utils');
const { Serializer } = require('../helpers/serializer');
const { Compound } = require('../models/Compound');

const compoundSchemaPATCH = require('../requestSchemas/compoundSchemaPATCH');

module.exports.main = async event => {
  try {
    let { id } = event.pathParameters;
    if (event.queryStringParameters) {
      // Do not allow any queryString parameters
      if (event.queryStringParameters) {
        const message = `Query string parameters are not accepted at this resource. Query string parameters found: ${Object.keys(
          event.queryStringParameters
        ).join(', ')}`;
        throw formatBadRequestError({ message });
      }
    }

    // Make sure the ID is of mongoose schema type ObjectId
    if (Number.isNaN(Number(id))) {
      const message = `The provided compound id path parameter is not a valid format: must be a number. Instead, received: ${id}`;
      throw formatBadRequestError({ message });
    }

    await connectToDatabase();

    try {
      // Confirm the compound to be patched exists

      const compoundToDelete = await Compound.find({ compound_id: id });
      if (!compoundToDelete.length) {
        const message =
          'The compound you are trying to delete was not found. Please verify the compound id';
        throw formatNotFoundError({ message });
      }
    } catch (error) {
      throw formatDatabaseError(error);
    }

    // Validate and Parse the payload and prep for update
    if (event.body) {
      const message = 'DELETE does not accept a JSON body';
      throw formatBadRequestError({ message });
    }

    const deletedCompound = await Compound.findOneAndDelete({ compound_id: id });
    if (!deletedCompound) {
      const message =
        'The Compound you are trying to delete was not found. Please verify the Compound id';
      throw formatNotFoundError({ message });
    }
    return {
      statusCode: 204,
      headers: {
        'Content-Type': 'application/vnd.api+json; charset=utf-8'
      }
    };
  } catch (error) {
    return formatInternalError(error);
  }
};
