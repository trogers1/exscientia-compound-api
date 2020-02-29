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

const compoundSchemaPOST = require('../requestSchemas/compoundSchemaPOST');

module.exports.main = async event => {
  try {
    if (event.queryStringParameters) {
      throw formatBadRequestError({
        message: `Unrecognized query string parameter(s): ${Object.keys(badQueryParams).join(', ')}`
      });
    }
    let parsedBody = parseBody(event.body);
    let valid = ajv.validate(compoundSchemaPOST, parsedBody);
    if (!valid) {
      console.log('errors', ajv.errors);
      return formatValidationError(ajv.errors);
    }
    const deserializedCompound = await Serializer.deserialize('compound', parsedBody);
    let newDoc = Compound(deserializedCompound),
      doc;
    try {
      await connectToDatabase();
      const existingCompound = await Compound.find({
        compound_id: parsedBody.data.attributes.compound_id
      }).lean();
      if (existingCompound.length) {
        let message = `Found an existing compound with 'compound_id' of ${deserializedCompound.compound_id}. Cannot create a second compound with the same id`;
        throw formatBadRequestError({ message });
      }
      doc = await newDoc.save();
    } catch (error) {
      throw formatDatabaseError(error);
    }

    let serializedResponse = Serializer.serialize('compound', doc.toObject());

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/vnd.api+json; charset=utf-8',
        location: `/compounds/${serializedResponse.data.id}`
      },
      body: JSON.stringify(serializedResponse)
    };
  } catch (error) {
    return formatInternalError(error);
  }
};
