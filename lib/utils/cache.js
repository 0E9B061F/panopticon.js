'use string'


// This function creates a getter which memoizes a calculated value. The
// value is not calculated until the first time the getter is called.
// It is then stored in an immutable, unenumerable property named after
// the given prop but with a preceding underscore.
// It can be called externally on an object but works best in a constructor
// where all instances of a class will benefit.

module.exports = function cache(obj, prop, block) {
  const hidden = `_${prop}`
  Object.defineProperty(obj, prop, {enumerable: true,
    get: function() {
      if (!obj.hasOwnProperty(hidden)) {
        Object.defineProperty(obj, hidden, {value: block.call(obj)})
      }
      return obj[hidden]
    }
  })
}
