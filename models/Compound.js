const mongoose = require('mongoose');

let collection;
switch (ENV) {
  case 'ci':
    collection = 'LOCAL';
    break;
  case 'QA':
    collection = ENV;
    break;
  case 'PROD':
    collection = ENV;
    break;
  default:
    collection = 'LOCAL';
}

const compoundSchema = new mongoose.Schema(
  {
    compound_id: { type: Number, index: true },
    smiles: { type: String, index: true },
    molecular_weight: { type: Number, index: true },
    ALogP: { type: Number, index: true },
    molecular_formula: { type: String, index: true },
    num_rings: { type: Number, index: true },
    image: { type: String },
    assay_results: [
      {
        result_id: { type: Number, index: true },
        target: { type: String, index: true },
        result: { type: String, index: true },
        operator: { type: String, index: true },
        value: { type: Number },
        unit: { type: String }
      }
    ]
  },
  {
    collection: `compounds-${collection}`,
    timestamps: true
  }
);

/**
 * Create a global model based on the schema, and export it to be used in other files.
 * Using serverless-offline creates issues as one call will compile the schema, and then
 * a consecutive call will attempt to recompile the model throwing an error. Using a
 * global model avoids this error.
 */
let Compound = mongoose.models.Compound || mongoose.model('Compound', compoundSchema);
module.exports.Compound = Compound;
