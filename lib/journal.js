'use strict'

const { classify, repd } = require('./utils/typology.js')
const Event = require('./event.js')
const EventTree = require('./event-tree.js')



class Journal {
  constructor() {
    this.global = []
    this.typed = {}
    this.pathed = {}
    this.etree = new EventTree()
  }
  subscribe(...args) {
    this.etree.subscribe(...args)
  }
  enter(type, conf) {
    const e = Event(type, conf)
    this.global.push(e)
    if (!(e.type in this.typed)) this.typed[e.type] = []
    this.typed[e.type].push(e)
    if (!(e.path in this.pathed)) this.pathed[e.path] = []
    this.pathed[e.path].push(e)
    this.etree.notify(e)
    return e
  }
  print() {
    console.log(this.global.map(e=> e.str).join('\n'))
  }
  printType(t) {
    if (t in this.typed) {
      console.log(this.typed[t].map(e=> e.str).join('\n'))
    }
  }
  printPath(p) {
    if (p in this.pathed) {
      console.log(this.pathed[p].map(e=> e.str).join('\n'))
    }
  }
}


module.exports = Journal
