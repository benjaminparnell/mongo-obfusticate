var MongoClient = require('mongodb').MongoClient
  , assert = require('assert')
  , async = require('async')
  , faker = require('faker')
  , crypto = require('crypto')
  , generateFakeData = require('../lib/fake-data-generator')
  , extend = require('lodash.assign')
  , obfusticate = require('..')
  , schemas = {
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
    , userCollection
    , questionResposeCollection

  before(function (done) {
    var url = 'mongodb://localhost:27017/mongo-obfusticate-test-' +
      crypto.randomBytes(10).toString('hex')
    MongoClient.connect(url, function (err, dbConnection) {
      if (err) return done(err)
      db = dbConnection
      userCollection = db.collection('user')
      questionResposeCollection = db.collection('questionResponse')
      done()
    })
  })

  afterEach(function (done) {
    async.parallel([
      userCollection.remove.bind(userCollection, {})
    , questionResposeCollection.remove.bind(questionResposeCollection, {})
    ], done)
  })

  it('should obfusticate data in all collections passed to it', function (done) {
    var questionResponseFixtures = createQuestionResponseFixtures(30)
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

  it('should return a counts of all processed items group by collection', function (done) {
    var questionResponseFixtures = createQuestionResponseFixtures(40)
      , userFixtures = createUserFixtures(50)

    async.parallel([
      userCollection.insertMany.bind(userCollection, userFixtures)
    , questionResposeCollection.insertMany.bind(questionResposeCollection, questionResponseFixtures)
    ], function (err) {
      if (err) return done(err)
      obfusticate(schemas, db, function (err, counts) {
        if (err) return done(err)
        assert.deepEqual(counts, {
          user: 50
        , questionResponse: 40
        })
        done()
      })
    })
  })

  it('should emit an event whenever an insert occurs', function (done) {
    var userFixtures = createUserFixtures(21)

    userCollection.insertMany(userFixtures, function (err) {
      if (err) return done(err)
      var count = 0
        , emitter = obfusticate(schemas, db, function (err) {
            if (err) return done(err)
            assert.equal(count, 21)
            done()
          })

      emitter.on('insert', function () {
        count++
      })
    })
  })

  it('should emit an event counting all existing objects it expects to obfusticate before running', function (done) {
    var userFixtures = createUserFixtures(21)
      , questionResponseFixtures = createQuestionResponseFixtures(29)
      , expectedCounts = {
          user: 21
        , questionResponse: 29
        }
      , assertRan = false
      , countsEmittedAt

    async.parallel([
      userCollection.insertMany.bind(userCollection, userFixtures)
    , questionResposeCollection.insertMany.bind(questionResposeCollection, questionResponseFixtures)
    ], function (err) {
      if (err) return done(err)
      var emitter = obfusticate(schemas, db, function (err) {
            if (err) return done(err)
            assert.ok(assertRan)
            done()
          })

      emitter.once('insert', function () {
        assert.ok(countsEmittedAt < new Date())
      })

      emitter.on('counts', function (counts) {
        assert.deepEqual(counts, expectedCounts)
        assertRan = true
        countsEmittedAt = new Date()
      })
    })
  })

  it('should obfusticate collection data only in all collections passed to it', function (done) {
    var questionResponseFixtures = createQuestionResponseFixtures(30)
      , userFixtures = createUserFixtures(10)
      , extendedSchemas =
          { user: extend({}, schemas.user
            , { occupation: function () { return 'Wizard' }
              })
          , questionResponse: extend({}, schemas.questionResponse
            , { shape: function () { return 'square' }
              })
          }

    async.parallel([
      userCollection.insertMany.bind(userCollection, userFixtures)
    , questionResposeCollection.insertMany.bind(questionResposeCollection, questionResponseFixtures)
    ], function (err) {
      if (err) return done(err)
      obfusticate(extendedSchemas, db, function (err) {
        if (err) return done(err)
        async.each(Object.keys(extendedSchemas), function (collectionName, eachCb) {
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
