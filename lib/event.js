'use strict'


class EventBase {
  constructor(group, type) {
    this.group = group
    this.type = type
  }
  get signature() { return `${this.group}:${this.type}` }
  get _head() { return `[${this.signature}]`}
  get _tail() { return '' }
  get toString() {
    if (!this._string) {
      this._string = `${this._head} ${this._tail}`
    }
    return this._string
  }
}

const Events = {}
Events.all = {}

const Event = function(sig, conf={}) {
  return new Events.all[sig](conf)
}
Event.canonical = {
  all: []
}
Event['*'] = '*'

function permute(g, t, block) {
  g.forEach(gn=> t.forEach(tn=> block(`${gn}:${tn}`)))
}

Events.group = function(gnames, gargs='', gwriter=false) {
  gnames = gnames.split(':')
  const gn = gnames[0]
  const galias = gnames.slice(1)
  if (typeof(gargs) == 'function') {
    gwriter = gargs
    gargs = ''
  }
  gargs = gargs.split(' ')
  gnames.forEach(n=> Event[n] = {'*': `${gn}*`})
  Event.canonical[gn] = []

  Events[gn] = function(tnames, targs='', twriter=false) {
    tnames = tnames.split(':')
    const tn = tnames[0]
    const talias = tnames.slice(1)
    if (typeof(targs) == 'function') {
      twriter = targs
      targs = ''
    }
    targs = targs.split(' ')
    const args = [...gargs, ...targs]

    const eventClass = class extends EventBase {
      constructor(conf={}) {
        super(gn, tn)
        for (let i = 0; i < args.length; i++) {
          this[args[i]] = conf[args[i]]
        }
      }
      get _tail() {
        const g = gwriter.call(this, ...gargs.map(a=> this[a]))
        const t = twriter.call(this, ...targs.map(a=> this[a]))
        return `${g} ${t}`
      }
    }

    gnames.forEach(g=> tnames.forEach(t=> Event[g][t] = `${gn}:${tn}`))
    permute(gnames, tnames, n=> Events.all[n] = eventClass)
    Event.canonical.all.push(`${gn}:${tn}`)
    Event.canonical[gn].push(`${gn}:${tn}`)
  }
}


Events.group('STATE:S', 'trap path', (t,p)=> `(${t}) ${p}`)
Events.STATE('idleop:idl')
Events.STATE('freeze:frz')
Events.STATE('extend:ext', 'new', (n)=> `-> ${n}`)
Events.STATE('delete:del', 'old', (o)=> `(was) ${o}`)
Events.STATE('adjust:adj', 'old new', (o,n)=> `${o} -> ${n}`)
Events.STATE('update:upd', 'old new', (o,n)=> `${o} -> ${n}`)
Events.STATE('modify:mod', 'old new', (o,n)=> `${o} -> ${n}`)
Events.STATE('mutate:mut', 'old new', (o,n)=> `${o} -> ${n}`)

Events.group('UTILITY:U')
Events.UTILITY('logged:log')
Events.UTILITY('notice:msg')


module.exports = Event
