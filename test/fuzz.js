'use strict'

const panopticon = require('./panopticon.js')
const random = require('./utils/new-random.js')

const OPS = ['set', 'delete', 'dprop', 'aprop']

const s = panopticon.create()

const limit = 10000

const o = {}

let ri
let rv
const nested = [[s], []]
let t
for (let i = 0; i < limit; i+=1) {
  t = random.pick(random.pick(nested)) || s
  switch(random.pick(OPS)) {
    case 'set':
      ri = random.ident()
      rv = random.value()
      t[ri] = rv
      if (rv != null && !Array.isArray(rv) && typeof(rv) == 'object') {
        nested[1].push(t[ri])
      }
    break
    case 'dprop':
      ri = random.ident()
      rv = random.value()
      Object.defineProperty(t,ri, {
        value: rv,
        enumerable: true, writable: true, configurable: true
      })
      if (rv != null && !Array.isArray(rv) && typeof(rv) == 'object') {
        nested[1].push(t[ri])
      }
    break
    case 'aprop':
      ri = random.ident()
      rv = random.value()
      Object.defineProperty(t,ri, {
        get: ( )=> rv,
        set: (a)=> a,
        enumerable: true, configurable: true
      })
      if (rv != null && !Array.isArray(rv) && typeof(rv) == 'object') {
        nested[1].push(t[ri])
      }
    break
    case 'delete':
      ri = random.pick(Object.keys(t))
      delete t[ri]
    break
  }
}

//console.log(s._handler.history.global.length)
//console.log(s._handler.history.print())
console.log(s)
