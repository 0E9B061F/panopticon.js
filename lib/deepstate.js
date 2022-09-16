'use strict'

const deepAssign = require('./utils/deep-assign.js')
const { compound, primitive } = require('./utils/typology.js')
const Journal = require('./journal.js')
const { Reference } = require('./resolution.js')
const Path = require('./path.js')
const Event = require('./event.js')




class Handler {
  constructor(parent, prop) {
    if (parent) {
      this.history = parent.history
      this.path = parent.pathto(prop)
    } else {
      this.history = new Journal()
      this.path = []
    }
    this.parent = parent
    this.children = {}
    this.root = this.parent ? this.parent.root : this
    this._count = 1
  }

  get count() { return this.root._count }

  pathto(p) { return [...this.path, p] }
  branch(p, v) {
    this.root._count += 1
    this.children[p] = new Handler(this, p)
    return new Proxy(v, this.children[p])
  }
  dispatch(p, dis) { this.dispatches[p] = dis }
  subscribe(cb, paths, types=null) {
    if (!Array.isArray(paths)) paths = [paths]
    paths = paths.map(p=> new Path(p, this.path))
    paths = paths.map(p=> p.pure)
    this.history.subscribe(cb, paths, types)
  }
  go(path) {
    if (path[0] == '/') this.root.go(path.slice(1))
    if (typeof(path) == 'string') path = path.split('.')
    let h = this
    path.forEach(p=> {
      if (h.children[p]) h = h.children[p]
      else throw new Error(`Invalid path: ${path.join('.')}`)
    })
    return h
  }

  get(o,p,r) {
    return o[p]
  }
  set(o,p,v) {
    const ref = new Reference(o, p)
    const res = ref.set(v)
    if (res.valid) {
      if (compound(v)) v = this.branch(p, v)
      o[p] = v
      this.history.enter(res.type, {trap: 'set',
        path: new Path(this.pathto(p)),
        old: res.ref, new: res
      })
    }
    return true
  }
  defineProperty(o,p,d) {
    const ref = new Reference(o, p)
    const res = ref.resolve(d)
    if (res.valid) {
      if (d.value && compound(d.value)) d.value = this.branch(p, d.value)
      Object.defineProperty(o,p,d)
      this.history.enter(res.type, {trap: 'def',
        path: new Path(this.pathto(p)),
        old: res.ref, new: res
      })

    }
    return true
  }
  deleteProperty(o,p) {
    const ref = new Reference(o, p)
    if (ref.exists && ref.configurable) {
      delete o[p]
      if (this.children[p]) delete this.children[p]
      this.history.enter(Event.S.delete, {trap: 'del',
        path: new Path(this.pathto(p)),
        old: ref
      })

    }
    return true
  }
}


function create(defaults=null) {
  const handler = new Handler()
  const ghost = {}
  Object.defineProperty(ghost, '_handler', {value: handler})
  const state = new Proxy(ghost, handler)
  if (defaults) deepAssign(state, defaults)
  return state
}


module.exports = {
  Handler, create
}
