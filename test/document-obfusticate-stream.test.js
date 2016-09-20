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

  describe('constrainToDataKeys', function () {
    it('should add provided schema fields to objects if not set', function (done) {
      var schema = {
            firstName: 'name.firstName'
          , phone: 'phone.phoneNumber'
          , bitcoinWallet: 'finance.bitcoinAddress'
          }
        , originalData = { _id: 1, firstName: 'name' }
        , stream = new DocumentObfusticateStream(schema)

      stream
        .pipe(streamAssert.first(function (data) {
          assert.equal(Object.keys(data).length, 4, 'Fields not added to the data')
          Object.keys(schema).forEach(function (key) {
            assert.equal(typeof data[key], 'string')
          })
        }))
        .pipe(streamAssert.end(done))
        .end()

      stream.write(originalData)
    })

    it('should add provided schema fields to objects if false', function (done) {
      var schema = {
            firstName: 'name.firstName'
          , phone: 'phone.phoneNumber'
          , bitcoinWallet: 'finance.bitcoinAddress'
          }
        , originalData = { _id: 1, firstName: 'name' }
        , stream = new DocumentObfusticateStream(schema, false)

      stream
        .pipe(streamAssert.first(function (data) {
          assert.equal(Object.keys(data).length, 4, 'Fields not added to the data')
          Object.keys(schema).forEach(function (key) {
            assert.equal(typeof data[key], 'string')
          })
        }))
        .pipe(streamAssert.end(done))
        .end()

      stream.write(originalData)
    })

    it('should not add provided schema fields to objects if true', function (done) {
      var schema = {
            firstName: 'name.firstName'
          , phone: 'phone.phoneNumber'
          , bitcoinWallet: 'finance.bitcoinAddress'
          }
        , originalData = { _id: 1, firstName: 'name' }
        , stream = new DocumentObfusticateStream(schema, true)

      stream
        .pipe(streamAssert.first(function (data) {
          assert.equal(Object.keys(data).length, 2, 'Fields added to the data')
          Object.keys(originalData).forEach(function (key) {
            assert.equal(typeof data[key], typeof originalData[key])
            if (key !== '_id') assert.notEqual(originalData[key], data[key])
          })
        }))
        .pipe(streamAssert.end(done))
        .end()

      stream.write(originalData)
    })
  })
})
