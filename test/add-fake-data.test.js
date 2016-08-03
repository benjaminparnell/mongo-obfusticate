var assert = require('assert')
  , streamAssert = require('stream-assert')
  , addFakeData = require('../lib/add-fake-data')

describe('#addFakeData', function () {
  it('should add some data to an object piped to it', function (done) {
    var schema = {
          firstName: 'name.firstName'
        , phone: 'phone.phoneNumber'
        , bitcoinWallet: 'finance.bitcoinAddress'
        }
      , stream = addFakeData(schema)

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
