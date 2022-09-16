'use strict'


const PathExp = {
  abs: /^\/(?=\w)/,
  parts: /\w+/g,
  globbed: /(?<=\w\.)\*$/,
}

class Path {
  constructor(path, origin=[]) {
    if (Array.isArray(path)) path = path.join('.')
    this.path = path
    this.abs = path.match(PathExp.abs)
    this.globbed = path.match(PathExp.globbed)
    this._parts = path.match(PathExp.parts)
    this.setOrigin(origin)
  }
  setOrigin(origin) {
    if (typeof(origin) == 'string') origin = origin.match(PathExp.parts)
    this.parts = this.abs ? this._parts : [...origin, ...this._parts]
    this.pure = this.parts.join('.')
    this.origin = origin
  }
  test(b) {
    if (this.globbed) return b.startsWith(this.pure)
    else return this.pure == b
  }
}


module.exports = Path
