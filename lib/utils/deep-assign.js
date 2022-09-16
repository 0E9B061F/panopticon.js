'use-strict'


function deepAssign(a, b) {
  Object.entries(b).forEach(p=> {
    if (!Array.isArray(p[1]) && typeof(p[1]) == 'object') {
      a[p[0]] = {}
      deepAssign(a[p[0]], p[1])
    } else {
      a[p[0]] = p[1]
    }
  })
  return a
}


module.exports = deepAssign
