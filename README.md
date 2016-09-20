# mongo-obfusticate [![Build Status](https://travis-ci.org/benjaminparnell/mongo-obfusticate.svg?branch=master)](https://travis-ci.org/benjaminparnell/mongo-obfusticate) [![Coverage Status](https://coveralls.io/repos/github/benjaminparnell/mongo-obfusticate/badge.svg?branch=master)](https://coveralls.io/github/benjaminparnell/mongo-obfusticate?branch=master)

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

### obfusticate(schemas, dbConnection, options, cb)

Obfusticates all data in the collections denoted by the keys of the `schemas`
object (like the example shown above). `dbConnection` is an instance of
`MongoClient`.

`options` is an optional parameter and can be omitted. If omitted the default options as described below will be used.

#### options

##### constrainToDataKeys
**Default:** `false`

If set to `true` then no keys not already on the items will be obfusticated. If `false` then all the keys provided in the `schemas` object will be obfusticated and added to the items in the collection even if they did not previously exist. This only applies for top-level keys and is not enforced for any nested keys even if set to `true`.

## Credits
[Ben Parnell](https://github.com/benjaminparnell)
