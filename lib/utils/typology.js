'use strict'


const compounds  = ['object', 'function']


function classify(o) {
  if (o === null) return 'null'
  else if (Array.isArray(o)) return 'array'
  else return typeof(o)
}

function compound(o) {
  return (o != null && (Array.isArray(o) || compounds.includes(typeof(o))))
}

function primitive(o) { return !compound(o) }

function repd(d) {
  if (d.data) return rep(d.vv)
  else if (d.hg && d.hs) return `get+set`
  else if (d.get) return `get`
  else if (d.set) return `set`
}

function rep(o) {
  if (o === null) return 'null'
  else if (o === undefined) return 'undefined'
  else if (o === true) return 'true'
  else if (o === false) return 'false'
  else if (typeof(o) == 'string') return `'${o}'`
  else if (typeof(o) == 'number') return o.toString()
  else if (Array.isArray(o)) {
    if (o.length) return '[...]'
    else return '[]'
  }
  else if (typeof(o) == 'function') {
    const len = o.length || ''
    if (o.name) return `${o.name}(${len})`
    return `f(${len})`
  } else {
    const name = o.constructor.name
    const len = Object.keys(o).length
    if (name == 'Object') {
      if (len) return `{${len}}`
      else return '{}'
    } else {
      if (len) return `${name}{${len}}`
      else return `${name}{}`
    }
  }
}


module.exports = { classify, compound, primitive, rep, repd }
