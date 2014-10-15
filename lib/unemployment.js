var request = require('request')
  , moment = require('moment')
  , _ = require('lodash')

module.exports.current = function (next) {
  next = next || function () {}

  fetch(function (err, data) {
    if (err) { return next(err) }

    var sorted = _.sortBy(data, function (item) {
      return item.year + item.period
    })

    var current = Number(sorted[sorted.length-1].value)
      , last = Number(sorted[sorted.length-2].value)
      , diff = current - last

    next(null, {
      current: current,
      last: last,
      diff: diff
    })
  })
}

function currentPeriod() {
  return period(moment())
}

function lastPeriod() {
  return period(moment().subtract(1, 'month'))
}

function period (date) {
  return {
    year: date.format('YYYY'),
    period: date.format('[M]MM')
  }
}

function fetch (next) {
  request({
    url: 'http://api.bls.gov/publicAPI/v1/timeseries/data/LNS14000000',
    json: true
  }, function (err, response, body) {
    if (err) { return next(err) }

    if (response.statusCode !== 200) {
      return next(new Error ('HTTP error: ' + response.statusCode))
    }

    if (body.message && body.message.length > 0) {
      // TODO all the errors
      return next(new Error (body.message[0]))
    }

    // TODO null checks
    // Should only be one series, so this should be safe
    next(null, body.Results.series[0].data)
  })
}
