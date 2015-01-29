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

module.exports.history = function (opt, next) {
  if (typeof opt === 'function') {
    next = opt
    opt = {}
  }

  var start = opt.start ? moment(opt.start) : moment().subtract(10, 'years')
  var end = opt.end ? moment(opt.end) : moment()

  fetch({start: start.format('YYYY'), end: end.format('YYYY')}, function (err, data) {
    if (err) { return next(err) }

    var filtered = _.chain(data)
      .map(function (item) {
        return {
          date: moment(item.year + item.period, 'YYYY[M]MM'),
          value: item.value
        }
      })
      .filter(function (item) {
        return item.date.isAfter(start) && item.date.isBefore(end)
      })
      .sortBy(function (item) {
        return item.date.format('YYYYMM')
      }).value()

    next(null, filtered)
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

function fetch (opt, next) {
  if (typeof opt === 'function') {
    next = opt
    opt = {}
  }

  var start = opt.start || moment().format('YYYY')
    , end = opt.end || moment().format('YYYY')

  request({
    url: 'http://api.bls.gov/publicAPI/v1/timeseries/data/',
    body: {
      seriesid: [ 'LNS14000000' ],
      startyear: start,
      endyear: end
    },
    method: 'POST',
    json: true
  }, function (err, response, body) {
    if (err) { return next(err) }

    if (response.statusCode !== 200) {
      return next(new Error ('HTTP error: ' + response.statusCode))
    }

    if (body.message && body.message.length > 0) {
      // TODO all the errors
      if (body.message[0] == 'End year is invalid.') {
        // If there's no data for that year yet, this will bomb. Causes problems in January.
        // Just retry with the previous year
        return fetch({
          start: start,
          end: moment(end, 'YYYY').subtract(1, 'years').format('YYYY')
        }, next)
      }
      return next(new Error (body.message[0]))
    }

    // TODO null checks
    // Should only be one series, so this should be safe
    next(null, body.Results.series[0].data)
  })
}
