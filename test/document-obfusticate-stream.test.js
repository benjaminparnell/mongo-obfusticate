var assert = require('assert')
  , stream = require('stream')
  , streamAssert = require('stream-assert')
  , DocumentObfusticateStream = require('../lib/document-obfusticate-stream')

describe('#DocumentObfusticateStream', function () {
  it('should be an instance of stream.Transform', function () {
    assert.equal(new DocumentObfusticateStream({}) instanceof stream.Transform, true)
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
})