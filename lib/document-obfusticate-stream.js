module.exports = DocumentObfusticateStream

var TransformStream = require('stream').Transform
  , generateFakeData = require('./fake-data-generator')
  , extend = require('lodash.assign')
  , pick = require('lodash.pick')

function DocumentObfusticateStream (schema, constrainToDataKeys) {
  TransformStream.call(this)
  this._writableState.objectMode = true
  this._readableState.objectMode = true
  this.constrainToDataKeys = constrainToDataKeys
  this.schema = schema
}

DocumentObfusticateStream.prototype = Object.create(TransformStream.prototype)

DocumentObfusticateStream.prototype._transform = function (chunk, encoding, callback) {
  var itemKeys = Object.keys(chunk)
    , schema = !this.constrainToDataKeys ? this.schema : pick(this.schema, itemKeys)

  chunk = extend({}, chunk, generateFakeData(schema))
  this.push(chunk)
  callback()
}
