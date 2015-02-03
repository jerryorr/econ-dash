var JSONStream = require('JSONStream')
  , es = require('event-stream')
  , reduce = require('stream-reduce')

module.exports = function (stream, next) {
  // TODO doing it this way means we miss any error messages
  stream
    .pipe(JSONStream.parse('Results.series.*'))
    .on('error', next)
    .pipe(reduce(function (all, data) {
      all[data.seriesID] = data.data
      return all
    }, {}))
    .on('data', function (all) {
      next(null, all)
    })
    .on('error', next)
}