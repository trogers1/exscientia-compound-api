const JSONAPISerializer = require('json-api-serializer');
const Serializer = new JSONAPISerializer();

const baseOptions = {
  id: 'compound_id',
  blacklist: ['__v', '_id'],
  jsonapiObject: false
};

Serializer.register('compound', {
  ...baseOptions,
  topLevelMeta: (data, extraData) => {
    if (!Array.isArray(data)) {
      return null;
    }
    return {
      count: data.length,
      totalAvailable: extraData.total
    };
  }
});

module.exports.Serializer = Serializer;
