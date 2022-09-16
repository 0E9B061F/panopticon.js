'use strict'

const Event = require('./event.js')


class Reference {
  constructor(o,p) {
    const conf = Object.getOwnPropertyDescriptor(o,p)
    this.exists = conf !== undefined
    this.extensible = Object.isExtensible(o)
    this.data = false
    this.accessor = false
    if (this.exists) {
      this.ve = conf.enumerable
      this.vc = conf.configurable
      if (conf.hasOwnProperty('value')) {
        this.data = true
        this.vv = conf.value
        this.vw = conf.writable
      } else {
        this.accessor = true
        this.vg = conf.get
        this.vs = conf.set
      }
    }
  }
  get nonexistent() { return !this.exists }
  get configurable() { return this.vc }
  resolve(conf) {
    return new Resolution(this, conf)
  }
  set(value) {
    return this.resolve({value,
      enumerable: true,
      configurable: true,
      writable: true
    })
  }
}

class Resolution {
  constructor(ref, conf) {
    this.he = conf.hasOwnProperty('enumerable')
    this.hc = conf.hasOwnProperty('configurable')
    this.hv = conf.hasOwnProperty('value')
    this.hw = conf.hasOwnProperty('writable')
    this.hg = conf.hasOwnProperty('get')
    this.hs = conf.hasOwnProperty('set')
    const vg = typeof(conf.get == 'function')
    const vs = typeof(conf.set == 'function')
    if (this.hg && !vg) throw new Error('Invalid getter')
    if (this.hs && !vs) throw new Error('Invalid setter')
    if (this.hd && this.ha) {
      throw new Error('Invalid descriptor: mixed data and accessor properties')
    }
    this.ref = ref
    this.valid = false
    this.empty = false
    this.data = false
    this.accessor = false
    if (this.he) this.ve = conf.enumerable
    if (this.hc) this.vc = conf.configurable
    if (!this.ha) {
      if (!this.hd && !this.hb) this.empty = true
      this.data = true
      this.flavor = 'data'
      if (this.hv) this.vv = conf.value
      if (this.hw) this.vw = conf.writable
    } else {
      this.accessor = true
      this.flavor = 'accessor'
      this.vg = this.hg ? conf.get : undefined
      this.vg = this.hs ? conf.set : undefined
    }
    if (this.ref.nonexistent) {
      this.type = Event.S.extend
      this.valid = this.ref.extensible
      this.useDefault()
    } else {
      if (this.empty) {
        this.type = Event.S.idelop
        this.valid = true
      } else if (this.cf) {
        this.type = Event.S.mutate
        this.valid = this.ref.vc
        this.useDefault()
      } else if (this.data) {
        if (!this.cv) {
          if (this.adj) {
            this.type = Event.S.adjust
            if (this.cb) this.valid = this.ref.vc
            else if (this.cw) this.valid = this.ref.vw
          } else {
            this.type = Event.S.idelop
            this.valid = true
          }
        } else {
          if (this.upd) this.type = Event.S.update
          else this.type = Event.S.modify
          if (!this.cb) this.valid = this.ref.vw
          else this.valid = this.ref.vc
        }
      } else if (this.accessor) {
        if (!this.ca) {
          if (this.cb) {
            this.type = Event.S.adjust
            this.valid = this.ref.vc
          } else {
            this.type = Event.S.idelop
            this.valid = true
          }
        } else {
          this.type = Event.S.modify
          this.valid = this.ref.vc
        }
      }
    }
  }
  get hb() { return this.hc || this.he }
  get hd() { return this.hv || this.hw }
  get ha() { return this.hg || this.hs }
  get ce() { return this.he && this.ve != this.ref.ve }
  get cc() { return this.hc && this.vc != this.ref.vc }
  get cb() { return this.ce || this.cc }
  get cw() { return this.ref.data && this.hw && this.vw != this.ref.vw }
  get cv() { return this.ref.data && this.hv && this.vv !== this.ref.vv }
  get cf() { return this.flavor != this.ref.flavor }
  get cg() { return this.ref.accessor && this.hg && this.vg != this.ref.vg }
  get cs() { return this.ref.accessor && this.hs && this.vs != this.ref.vs }
  get ca() { return this.cg || this.cs }
  get upd() { return classify(this.vv) == classify(this.ref.vv) }
  get map() {
    if (this.ref.exists) return [this.ref, this]
    else return [this]
  }
  get valmap() {
    if (this.ref.exists) return [this.ref.vv, this.vv]
    else return [this.vv]
  }
  useDefault() { if (this.data && !this.hv) this.value = undefined }
}


module.exports = { Reference, Resolution }
