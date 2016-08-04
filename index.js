module.exports = obfusticate

var async = require('async')
  , MongoStream = require('find-and-modify-stream')
  , DocumentObfusticateStream = require('./lib/document-obfusticate-stream')

function obfusticate (schemas, dbConnection, callback) {
  var collections = Object.keys(schemas)

  async.eachSeries(collections, function (collection, cb) {
    var updateStream = new MongoStream({ connection: dbConnection, collection: collection })
      , findStream = dbConnection.collection(collection).find({}).stream()
      , documentObfusticationStream = new DocumentObfusticateStream(schemas[collection])

    updateStream.on('finish', cb)

    findStream
      .pipe(documentObfusticationStream)
      .pipe(updateStream)
  }, callback)
}

