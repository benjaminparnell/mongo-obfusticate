module.exports = obfusticate

var async = require('async')
  , MongoStream = require('find-and-modify-stream')
  , addFakeData = require('./lib/add-fake-data')

function obfusticate (schemas, dbConnection, callback) {
  var collections = Object.keys(schemas)

  async.eachSeries(collections, function (collection, cb) {
    var updateStream = new MongoStream({ connection: dbConnection, collection: collection })
      , findStream = dbConnection.collection(collection).find({}).stream()

    updateStream.on('finish', cb)

    findStream
      .pipe(addFakeData(schemas[collection]))
      .pipe(updateStream)
  }, callback)
}

