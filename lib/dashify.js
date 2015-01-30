var JSONStream = require('JSONStream')
  , _ = require('lodash')

module.exports.speedometer = function (stream, results, opt) {
  opt = opt || {}
  var data = results.current

  var formatted = opt.datatype == 'percent' ? (data.current + '%') : data.current

  var output = {
    value: data.current,
    formatted: formatted
  }

  opt.start && (output.start = opt.start)
  opt.end && (output.end = opt.end)

  stream.write(JSON.stringify(output))
}

module.exports.diff = function(stream, results, opt) {
  opt = opt || {}
  var data = results.current

  var diff = data.diff.toFixed(1)
  if (data.diff >= 0) {
    diff = '+' + diff
  }

  var formatted = opt.datatype == 'percent' ? (diff + '%') : diff

  stream.write(formatted)
}

module.exports.history = function(stream, results, opt) {
  opt = opt || {}
  var data = results.history

  var formatted = _.map(data, function (item) {
    return {
      title: item.date.format('MMM YYYY'),
      value: item.value
    }
  })

  var output = {
    graph: {
      title: opt.title,
      datasequences: [
        {
          title: opt.title,
          datapoints: formatted
        }
      ]
    }
  }

  var jstream = JSONStream.stringify(false)
  jstream.pipe(stream)
  jstream.write(output)
  jstream.end()
}