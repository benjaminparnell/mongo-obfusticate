# mongo-obfusticate [![Build Status](https://travis-ci.org/benjaminparnell/mongo-obfusticate.svg?branch=master)](https://travis-ci.org/benjaminparnell/mongo-obfusticate)

Obfusticate sensitive data stored in MongoDB using
[faker](https://github.com/Marak/Faker.js) or your own functions.

## Installation

```sh
npm install --save mongo-obfusticate
```

## Usage

```js
var MongoClient = require('mongodb').MongoClient
  , obfusticate = require('mongo-obfusticate')
  , schemas = {
      'user': {
        firstName: 'name.firstName',
        lastName: 'name.lastName',
        phoneNumber: 123
        paymentInfo: {
          'account': 123
        }
      }
    }

MongoClient.connect(dbUrl, function (err, dbConnection) {
  obfusticate(schemas, dbConnection, callback)
})
```

## API

### obfusticate(schemas, dbConnection, cb)

Obfusticates all data in the collections denoted by the keys of the `schemas`
object (like the example shown above). `dbConnection` is an instance of
`MongoClient`.

## Credits
[Ben Parnell](https://github.com/benjaminparnell)