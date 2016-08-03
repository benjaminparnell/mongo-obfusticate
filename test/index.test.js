var MongoClient = require('mongodb').MongoClient
  , assert = require('assert')
  , async = require('async')
  , faker = require('faker')
  , crypto = require('crypto')
  , generateFakeData = require('../lib/generate-fake-data')
  , extend = require('lodash.assign')
  , obfusticate = require('../')

function createFixtures (fixtureFn, num) {
  return Array.apply(null, Array(num || 2)).map(fixtureFn)
}

function createUserFixtures (num) {
  return createFixtures(function () {
    return {
      firstName: faker.name.firstName()
    , lastName: faker.name.lastName()
    }
  }, num)
}

function createQuestionResponseFixtures (num) {
  return createFixtures(function () {
    return {
      color: 'commerce.color'
    , city: 'address.city'
    }
  }, num)
}

describe('#obfusticate', function () {
  var db

  before(function (done) {
    var url = 'mongodb://localhost:27017/cf-obfusticate-test-' +
      crypto.randomBytes(10).toString('hex')
    MongoClient.connect(url, function (err, dbConnection) {
      if (err) return done(err)
      db = dbConnection
      done()
    })
  })

  it('should obfusticate data in all collections passed to it', function (done) {
    var schemas = {
          'user': {
            'firstName': function () {
              return 'Ben'
            }
          , 'lastName': function () {
              return 'Parnell'
            }
          }
        , 'questionResponse': {
            'color': function () {
              return 'yellow'
            }
          , 'city': function () {
              return 'Nottingham'
            }
          }
        }
      , userCollection = db.collection('user')
      , questionResposeCollection = db.collection('questionResponse')
      , questionResponseFixtures = createQuestionResponseFixtures(30)
      , userFixtures = createUserFixtures(10)

    async.parallel([
      userCollection.insertMany.bind(userCollection, userFixtures)
    , questionResposeCollection.insertMany.bind(questionResposeCollection, questionResponseFixtures)
    ], function (err) {
      if (err) return done(err)
      obfusticate(schemas, db, function (err) {
        if (err) return done(err)
        async.each(Object.keys(schemas), function (collectionName, eachCb) {
          var collection = db.collection(collectionName)
          collection.find({}).toArray(function (err, docs) {
            if (err) return done(err)
            docs.forEach(function (doc) {
              var docWithFakeData = extend({}, generateFakeData(schemas[collectionName]), doc)
              assert.deepEqual(doc, docWithFakeData)
            })
            eachCb()
          })
        }, done)
      })
    })
  })

  after(function (done) {
    db.dropDatabase(done)
  })
})
