module.exports = obfusticate

var async = require('async')
  , MongoStream = require('find-and-modify-stream')
  , DocumentObfusticateStream = require('./lib/document-obfusticate-stream')
  , EventEmitter = require('events').EventEmitter

function obfusticate (schemas, db, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  var collections = Object.keys(schemas)
    , emitter = new EventEmitter()

  if (!callback) callback = function () {}

  async.series([
    countRecords.bind(null, collections, db, emitter)
  , run.bind(null, schemas, db, emitter, collections, options)
  ], function (err, res) {
    if (err) {
      emitter.emit('error', err)
      return callback(err)
    }
    emitter.emit('done', res[1])
    callback(null, res[1])
  })

  return emitter
}

function countRecords (collections, db, emitter, callback) {
  async.reduce(collections, {}, function (counts, collection, reduceCb) {
    db.collection(collection).count({}, function (err, count) {
      if (err) return reduceCb(err)
      counts[collection] = count
      reduceCb(null, counts)
    })
  }, function (err, counts) {
    if (err) return callback(err)
    // emit here so anything listening can use counts to monitor progress
    emitter.emit('counts', counts)
    callback()
  })
}

function run (schemas, db, emitter, collections, options, callback) {
  async.reduce(collections, {}, function (counts, collection, cb) {
    var updateStream = new MongoStream({ connection: db, collection: collection })
      , findStream = db.collection(collection).find({}).stream()
      , documentObfusticationStream =
          new DocumentObfusticateStream(schemas[collection], options.constrainToDataKeys)

    counts[collection] = 0

    updateStream.on('insert', function () {
      counts[collection]++
      emitter.emit('insert')
    })

    updateStream.on('finish', function () {
      cb(null, counts)
    })

    findStream
      .pipe(documentObfusticationStream)
      .pipe(updateStream)
  }, callback)
}
