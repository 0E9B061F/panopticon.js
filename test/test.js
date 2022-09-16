'use strict'

const panopticon = require('./panopticon.js')

const s = panopticon.create({
  global: {
    a: 1, b: 2, c: {}
  },
  local: {
    root: {
      13: {x: 77},
      21: {q: 5}
    },
    panel: {
      2: {p: 1},
      22: {p: 2},
      100: {p: 1},
      11: {p: 44},
      102: {p: 55},
    }
  }
})


s._handler.go('local.panel').subscribe({}, function(e) {console.log(e)})

s.global.zzz = 66
s.global.zzz = 'a'
delete s.global.zzz
s.local.root[13].x = 'stop!'
s.local.root[13].y = 'hammertime'
s.local.panel[3] = {}
s.local.panel[3].a = {}
s.local.panel[3].b = {}
s.local.panel[3].c = {}
delete s.local.panel[3].a
delete s.local.panel[3].b
delete s.local.panel[3].c
s.local.foo = {}
s.local.foo.bar = {}
s.local.foo.bar.baz = {}
