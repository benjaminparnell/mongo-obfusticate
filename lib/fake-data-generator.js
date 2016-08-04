module.exports = generateFakeData

var faker = require('faker')

function generateFakeData (schema) {
  return Object.keys(schema).reduce(function (fakeData, key) {
    if (typeof schema[key] === 'object') {
      fakeData[key] = generateFakeData(schema[key])
    } else if (typeof schema[key] === 'function') {
      fakeData[key] = schema[key]()
    } else if (typeof schema[key] === 'string') {
      // assume its a faker method
      var path = schema[key].split('.')

      if (path.length === 1) {
        // not a faker method
        fakeData[key] = schema[key]
      } else if (typeof faker[path[0]] === 'object' && typeof faker[path[0]][path[1]] === 'function') {
        fakeData[key] = faker[path[0]][path[1]]()
      } else {
        fakeData[key] = schema[key]
      }
    } else {
      fakeData[key] = schema[key]
    }
    return fakeData
  }, {})
}
