'use strict'

const Path = require('./path.js')
const Event = require('./event.js')


class Typed {
  constructor() {
    this.all = []
    this.table = {}
    Event.canonical.STATE.forEach(t=> this.table[t] = [])
  }
  get length() { return this.all.length }
  add(ss) {
    this.all.push(ss)
    ss.types.forEach(t=> this.table[t].push(ss))
  }
  remove(ss) {
    let i
    ss.types.forEach(t=> {
      i = this.table[t].indexOf(ss)
      this.table[t].splice(i, 1)
    })
    i = this.all.indexOf(ss)
    this.all.splice(i, 1)
  }
  get(t) { return this.table[t] }
}

class Subscriptions {
  constructor() {
    this.paths = new Typed()
    this.globs = new Typed()
  }
  get length() { return this.paths.length + this.globs.length }
  add(ss) {
    if (ss.globbed) this.globs.add(ss)
    else this.paths.add(ss)
  }
  remove(ss) {
    if (ss.globbed) this.globs.remove(ss)
    else this.paths.remove(ss)
  }
  get(t) { return [...this.paths.get(t), ...this.globs.get(t)] }
}

class Subscription {
  constructor(base, cb, paths, types=null) {
    this.base = base
    this.cb = cb
    if (!types || !types.length) this.types = Event.canonical.STATE
    if (typeof(paths) == 'string') paths = [paths]
    this.sentries = paths.map(p=> {
      p = new Path(p, base.dir)
      return new Sentry(this, p)
    })
  }
  alert(event) {
    this.base.root.alerts += 1
    this.cb.call(null, event)
  }
  subscribe() {
    let cwd
    this.sentries.forEach(sent=> {
      cwd = this.base.begin()
      sent.path.parts.forEach(part=> {
        cwd = cwd.branch(part)
      })
      cwd.subs.add(sent)
    })
  }
}

class Sentry {
  constructor(ss, path) {
    this.ss = ss
    this.path = path
  }
  get types() { return this.ss.types }
  get globbed() { return this.path.globbed }
  alert(...args) { this.ss.alert(...args) }
}

class EventTree {
  constructor(parent, prop) {
    if (parent) {
      this.parent = parent
      this.path = parent.path.concat([prop])
    } else {
      this.count = 1
      this.notices = 0
      this.alerts = 0
      this.parent = false
      this.path = []
    }
    this.visits = 0
    this.prop = prop
    this.children = {}
    this.root = this.parent ? this.parent.root : this
    this.subs = new Subscriptions()
    this.traces = []
    this.root.count += 1
  }
  get name() { return !this.parent ? '(ROOT)' : this.prop }
  get c() { return Object.values(this.children) }
  get dir() { return this.parent ? this.parent.path : [] }
  alert() { this.root.alerts += 1 }
  begin() {
    this.root.visits += 1
    this.root.allVisits += 1
    return this.root
  }
  branch(to) {
    if (this.children[to]) to = this.children[to]
    else to = this.children[to] = new EventTree(this, to)
    to.visits += 1
    this.root.allVisits += 1
    return to
  }
  go(to) {
    if (this.children[to]) {
      to = this.children[to]
      to.visits += 1
      this.root.allVisits += 1
      return to
    } else return false
  }
  subscribe(...args) {
    const sub = new Subscription(this, ...args)
    sub.subscribe()
    return sub
  }
  notify(event) {
    this.root.notices += 1
    const parts = event.path.parts
    let cwd = this.begin()
    for (let i=0; i<parts.length; i++) {
      cwd.subs.globs.get(event.signature).forEach(s=> s.alert(event))
      cwd = cwd.go(parts[i])
      if (!cwd) break
    }
    if (!cwd) return
    cwd.subs.paths.get(event.signature).forEach(s=> s.alert(event))
  }
}


module.exports = EventTree
