var assert = require('assert')
  , generateFakeData = require('../lib/fake-data-generator')

describe('#generateFakeData', function () {
  it('should generate fake data given a schema', function () {
    var schema = {
          firstName: 'name.firstName'
        , lastName: 'name.lastName'
        , title: 'name.title'
        }
      , fakeData = generateFakeData(schema)
    Object.keys(fakeData).forEach(function (key) {
      assert.equal(typeof fakeData[key], 'string')
      assert.notEqual(fakeData[key], schema[key])
    })
  })

  it('should generate data using a custom fn if a schema property has one', function () {
    var schema = {
          firstName: function () {
            return 'bob'
          }
        }
      , fakeData = generateFakeData(schema)
    assert.equal(fakeData.firstName, 'bob')
  })

  it('should generate fake data for nested objects', function () {
    var schema = {
        firstName: 'name.firstName'
      , lastName: 'name.lastName'
      , paymentInfo: {
          cardNumber: 'finance.account'
        , account: 'finance.accountName'
        }
      }
    , fakeData = generateFakeData(schema)
    assert.equal(typeof fakeData.paymentInfo.cardNumber, 'string')
    assert.equal(typeof fakeData.paymentInfo.account, 'string')
    assert.notEqual(fakeData.paymentInfo.cardNumber, schema.paymentInfo.cardNumber)
    assert.notEqual(fakeData.paymentInfo.account, schema.paymentInfo.account)
  })

  it('should assign a given string as fake data if it can\'t be split by dots', function () {
    var schema = {
          name: 'Harry'
        }
      , fakeData = generateFakeData(schema)
    assert.equal(fakeData.name, schema.name)
  })

  it('should handle a value that can be split by dots, but isn\'t a faker method', function () {
    var schema = {
          value: 'value.with.dots'
        }
      , fakeData = generateFakeData(schema)
    assert.equal(fakeData.dotValue, schema.dotValue)
  })

  it('should handle assigning numbers as fake data', function () {
    var schema = {
          number: 7
        }
      , fakeData = generateFakeData(schema)
    assert.equal(fakeData.number, schema.number)
  })
})
