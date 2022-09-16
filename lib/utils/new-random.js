'use strict'


const IDENT = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_'
const PLAIN = 'abcdefghijklmnopqrstuvwxyz'

const STRING = IDENT + '`!@#%^&*()+=-><?/[]|'
const NUMERALS = '0123456789'
const MISC = [true, false, null, undefined]
const BOOL = [true, false]

const VALUES = ['string', 'number', 'misc', 'obj', 'array']


function randomLength(min=1, max=10) {
  return min + Math.floor(Math.random() * max)
}
function pick(from) {
  return from[Math.floor(Math.random() * from.length)]
}
function bool() {
  return pick(BOOL)
}
function gather(from, times) {
  let out = ''
  for (var i = 0; i < times; i++) {
    out += pick(from)
  }
  return out
}


function randomIdent() {
  return gather(PLAIN, randomLength(1,5))
}

const values = {
  string: ( )=> gather(STRING, randomLength()),
  number: ( )=> parseInt(gather(NUMERALS, randomLength())),
  misc:   ( )=> pick(MISC),
  obj:    ( )=> Object.create(Object.prototype),
  array:  ( )=> [],
}

function randomVal() {
  return values[pick(VALUES)]()
}

module.exports = {
  VALUES,
  values,
  value: randomVal, ident: randomIdent, pick
}
