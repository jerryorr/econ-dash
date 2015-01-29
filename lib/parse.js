var JSONStream = require('JSONStream')
  , es = require('event-stream')
  , reduce = require('stream-reduce')

module.exports = function (stream, next) {
  // TODO probably tweak this to just take the whole BLS response
  stream
    .pipe(JSONStream.parse('*'))
    .on('error', next)
    .pipe(reduce(function (all, data) {
      // TODO maybe massage the data? moment() all the periods?
      all[data.seriesID] = data.data
      return all
    }, {}))
    .on('data', function (all) {
      next(null, all)
    })
    .on('error', next)
}