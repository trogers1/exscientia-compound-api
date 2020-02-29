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

      const compoundToPatch = await Compound.find({ compound_id: id });
      if (!compoundToPatch.length) {
        const message =
          'The compound you are trying to patch was not found. Please verify the compound id';
        throw formatNotFoundError({ message });
      }
    } catch (error) {
      throw formatDatabaseError(error);
    }

    // Validate and Parse the payload and prep for update
    if (!event.body) {
      const message = 'PATCH requests require a JSON body';
      throw formatBadRequestError({ message });
    }

    let parsedBody = parseBody(event.body);
    let valid = ajv.validate(compoundSchemaPATCH, parsedBody);
    if (!valid) {
      console.log('errors', ajv.errors);
      return formatValidationError(ajv.errors);
    }

    let deserializedCompound = await Serializer.deserialize('compound', parsedBody);
    let { compound_id, ...rest } = deserializedCompound;
    // Validation complete. Update the record in the DB. The { new: true } tells mongoose to return
    // the record after the update has occurred. By default, findOneAndUpdate() returns the record
    // as it was before the update as it originally found it.
    const updateResult = await Compound.findOneAndUpdate({ compound_id: id }, rest, {
      new: true
    });
    let serializedResponse = Serializer.serialize('compound', updateResult.toObject());
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
