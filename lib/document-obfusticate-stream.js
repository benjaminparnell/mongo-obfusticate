module.exports = DocumentObfusticateStream

var TransformStream = require('stream').Transform
  , generateFakeData = require('./fake-data-generator')
  , extend = require('lodash.assign')

function DocumentObfusticateStream (schema) {
  TransformStream.call(this)
  this._writableState.objectMode = true
  this._readableState.objectMode = true
  this._fakeData = generateFakeData(schema)
}

DocumentObfusticateStream.prototype = Object.create(TransformStream.prototype)

DocumentObfusticateStream.prototype._transform = function (chunk, encoding, callback) {
  chunk = extend({}, chunk, this._fakeData)
  this.push(chunk)
  callback()
}
