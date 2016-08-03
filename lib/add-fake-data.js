module.exports = addFakeData

var through = require('through2')
  , generateFakeData = require('./generate-fake-data')
  , extend = require('lodash.assign')

function addFakeData (schema) {
  var fakeData = generateFakeData(schema)

  return through.obj(function (chunk, enc, callback) {
    chunk = extend({}, chunk, fakeData)
    this.push(chunk)
    callback()
  })
}

