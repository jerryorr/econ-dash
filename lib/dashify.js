var JSONStream = require('JSONStream')
  , _ = require('lodash')
  , PassThrough = require('stream').PassThrough

module.exports.speedometer = function (results, opt) {
  opt = opt || {}
  var data = results.current

  var formatted = opt.datatype == 'percent' ? (data.current + '%') : data.current

  var output = {
    value: data.current,
    formatted: formatted
  }

  opt.start && (output.start = opt.start)
  opt.end && (output.end = opt.end)

  var stream = new PassThrough()
  stream.write(JSON.stringify(output))
  stream.end()
  return stream
}

module.exports.speedometer.contentType = 'application/json'

module.exports.diff = function(results, opt) {
  opt = opt || {}
  var data = results.current

  var diff = data.diff.toFixed(1)
  if (data.diff >= 0) {
    diff = '+' + diff
  }

  var formatted = opt.datatype == 'percent' ? (diff + '%') : diff

  var stream = new PassThrough()
  stream.write(formatted)
  stream.end()
  return stream
}

module.exports.diff.contentType = 'text/plain'

module.exports.history = function(results, opt) {
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

  process.nextTick(function () {
    jstream.write(output)
    jstream.end()
  })

  return jstream
}

module.exports.history.contentType = 'application/json'
