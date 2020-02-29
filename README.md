# Exscientia Compound API

This is a Serverless RESTful API built with Node and a MongoDB backend. It has the capabilities to GET, PATCH, POST, and DELETE compounds. For full documentation of the API, see `./docs.apib`, which is an [API Blueprint](https://apiblueprint.org/) file, but can be read much like a markdown file.

When testing/developing locally, it spins up two docker containers: one is a MongoDB container that contains an empty database, and the other seeds that database with the example compounds in `mongoseed/compounds.json`. This allows you to test the API with pseudo-idempotent data.

## Using the API Locally

Firstly, you'll need to have [`node`](https://nodejs.org/en/) and `npm` installed ([`nvm`](https://github.com/nvm-sh/nvm) may be a good option for this). Then, within the root repository directory, simply run:

```bash
$ npm i
# Installs all dependencies
$ npm start
```

This will start up the `serverless-offline` plugin to run the functions and listen locally at `localhost:4000` for the various routes designated in `serverless.yml`. In addition, it will spin up a docker container in the background with a seeded database. You can see the contents of the database in `mongoseed/compounds.json`.

## Running Unit Tests

While I didn't have enough time to get to all the testing I wanted to do, there are some limited unit tests that can be run with `npm run unit` or `npm test`. These only test the error formatters as is.

## Deploying

Automated CI/CD has been implemented for this API using [Codeship](https://codeship.com/) to create two different 'live' environments: QA and PROD, each using their own collection within a remote mongoDB database hosted by Mongo Atlas. The CI/CD pipeline works such that, whenever new code is pushed to the `qa` branch, the testing suite is run, and, if everything passes, the new code is automatically deployed to AWS. After you 'qa' the API using the new 'qa' environment/deployment, you can merge the changes to `master`, where the tests will be run again, and, should they pass, the API will be redeployed in the 'production' environment on AWS. You can see the deployment commands in the `package.json` under `scripts`: `deploy:qa` and `deploy:prod`.

## Using the API Remotely

The API has been deployed to AWS, so you can use it remotely like any other.

- QA Resources: `https://hirwghncp3.execute-api.us-west-2.amazonaws.com/QA/`.
- PROD Resources: `https://yvqzu8iyqb.execute-api.us-west-2.amazonaws.com/PROD/`

## What I Would Have Done If I Had More Time

The biggest thing I wish I had had time to add was testing. I had it all set up with the API Blueprint to start adding endpoint tests, but I just ran out of time. Testing is extremely important, so this project is very much work-in-progress until endpoint tests are added.

If I had more time, I would have like to add the following functionality as well:

- `GET` all endpoint:
  - A query param to include only certain kinds of assay results
  - A query param to include only certain kinds of operators
  - A query param to calculate and include the graph position of a compound (molecular_weight v ALogP)
  - Sort by
    - default: id
    - `num_rings`
    - weight
    - highest assay value
    - lowest assay value
    - hightest average of assay values
    - lowest average of assay values
- A new endpoint: `GET` element by `result_id`
- A new endpoint: `GET` to search `smiles`, `molecular_formula`, biological `target`
