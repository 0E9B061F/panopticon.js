'use strict'

const util = require('util')


const validName = '_valid'
const validateName = '_validate'

function makeItem(iname, names, index, e) {
  const item = Object.create(null)
  Object.defineProperties(item, {
    'name':    { value: names[0],       enumerable: true },
    'aliases': { value: names.slice(1), enumerable: true },
    'index':   { value: index,          enumerable: true },
    'enum':    { value: e,              enumerable: true },
  })
  const fname = `${iname}.${names[0]}`
  item[util.inspect.custom] = (depth, options)=> `${iname}.${names[0]}`
  return item
}

function makeEnum(name, str) {
  let ename
  let iname

  if (!str) {
    str = name
    ename = 'Enum'
    iname = 'Enum'
  } else {
    ename = `Enum:${name}`
    iname = name
  }

  const e = Object.create(null)
  Object.defineProperty(e, validName, {
    value: function(k) {
      if (typeof(k) == 'number') k = k.toString()
      if (k.name) k = k.name
      return Object.getOwnPropertyNames(e)
      .filter(x=> (x != validName) && (x != validateName))
      .includes(k)
    }
  })
  Object.defineProperty(e, validateName, {
    value: function(...keys) {
      for (let n = 0; n < keys.length; n += 1) {
        if (!e[validName](keys[n])) {
          console.log(keys)
          console.log(n)
          console.log(keys[n])
          throw new Error(`Invalid enumerator or index for ${ename}: '${keys[n]}'`)
        }
      }
    }
  })

  str = str.split(' ')
  //e[util.inspect.custom] = function (d,o) { return `${ename}< ${str.join(' ')} >` }

  let names
  let item

  for (let i = 0; i < str.length; i += 1) {
    names = str[i].split(':')
    item = makeItem(iname, names, i, e)
    for (let n = 0; n < names.length; n += 1) {
      Object.defineProperty(e, names[n], { enumerable: true, value: item })
    }
    Object.defineProperty(e, i, { value: item })
  }

  for (let i = 0; i < str.length; i += 1) {
    item = e[i]
    Object.defineProperties(item, {
      'prev': {
        enumerable: true,
        value: (i == 0) ? e[str.length-1] : e[i-1]
      },
      'next': {
        enumerable: true,
        value: (i == str.length-1) ? e[0] : e[i+1]
      }
    })
  }

  return e
}


module.exports = makeEnum
