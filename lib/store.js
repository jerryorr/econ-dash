var u = require('./unemployment')

var cache = {
  unemployment: {}
}

module.exports.start = function () {
  // TODO callback for when everything is loaded
  refresh()
  // refresh every hour
  setInterval(refresh, 60 * 60 * 1000)
}

function refresh () {
  u.current(function (err, data) {
    if (err) {
      return console.error('Error loading unemployment.current:', err)
    }

    cache.unemployment.current = data
  })

  u.history(function (err, data) {
    if (err) {
      return console.error('Error loading unemployment.history:', err)
    }

    cache.unemployment.history = data
  })
}

module.exports.unemployment = {
  current: function (next) {
    // TODO could wait for data if not loaded yet. Or persist to disk and
    // always read from there. Then I can return a stream, which would
    // be helpful on larger data sets
    next(null, cache.unemployment.current)
  },

  history: function (next) {
    next(null, cache.unemployment.history)
  }
}
