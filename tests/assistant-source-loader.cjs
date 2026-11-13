// Mirror Vite's ?raw imports without executing page components in Node tests.
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const originalLoad = Module._load
const root = path.resolve(__dirname, '..', 'src') + path.sep
Module._load = function (request, parent, ...rest) {
  if (typeof request === 'string' && request.endsWith('?raw')) {
    const filename = path.resolve(path.dirname(parent.filename), request.slice(0, -4))
    if (!filename.startsWith(root) || !filename.endsWith('.tsx')) throw Error('Unexpected raw source: ' + request)
    return { __esModule: true, default: fs.readFileSync(filename, 'utf8') }
  }
  return originalLoad.call(this, request, parent, ...rest)
}
