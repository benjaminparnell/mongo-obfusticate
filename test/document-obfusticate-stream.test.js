var assert = require('assert')
  , stream = require('stream')
  , streamAssert = require('stream-assert')
  , DocumentObfusticateStream = require('../lib/document-obfusticate-stream')

describe('#DocumentObfusticateStream', function () {
  it('should be an instance of stream.Transform', function () {
    assert.ok(new DocumentObfusticateStream({}) instanceof stream.Transform)
  })

  it('should add some data to an object piped to it', function (done) {
    var schema = {
          firstName: 'name.firstName'
        , phone: 'phone.phoneNumber'
        , bitcoinWallet: 'finance.bitcoinAddress'
        }
      , stream = new DocumentObfusticateStream(schema)

    stream
      .pipe(streamAssert.first(function (data) {
        Object.keys(schema).forEach(function (key) {
          assert.equal(typeof data[key], 'string')
        })
      }))
      .pipe(streamAssert.end(done))
      .end()

    stream.write({ _id: 1 })
  })

  it('should not add the same data to every object piped to it', function (done) {
    var schema = {
          firstName: 'name.firstName'
        , phone: 'phone.phoneNumber'
        , bitcoinWallet: 'finance.bitcoinAddress'
        }
      , stream = new DocumentObfusticateStream(schema)
      , firstObject

    stream
      .pipe(streamAssert.first(function (data) {
        firstObject = data
      }))
      .pipe(streamAssert.second(function (data) {
        assert.notDeepEqual(firstObject, data)
      }))
      .pipe(streamAssert.end(done))
      .end()

    stream.write({})
    stream.write({})
  })
})
