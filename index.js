"use strict"

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./lib/pdf-viewer.min')
} else {
  module.exports = require('./lib/pdf-viewer')
}