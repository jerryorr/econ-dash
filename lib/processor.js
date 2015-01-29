var _ = require('lodash')
  , moment = require('moment')

module.exports = function (data) {
  var results = {}

  results.current = current(data)
  results.history = history(data)

  return results
}

function current (data) {
  var sorted = _.sortBy(data, function (item) {
    return item.year + item.period
  })

  var current = Number(sorted[sorted.length-1].value)
    , last = Number(sorted[sorted.length-2].value)
    , diff = current - last

  return {
    current: current,
    last: last,
    diff: diff
  }
}

function history (data) {
  var filtered = _.chain(data)
    .map(function (item) {
      return {
        date: moment(item.year + item.period, 'YYYY[M]MM'),
        value: item.value
      }
    })
    // TODO do I want a date range filter?
    // .filter(function (item) {
    //   return item.date.isAfter(start) && item.date.isBefore(end)
    // })
    .sortBy(function (item) {
      return item.date.format('YYYYMM')
    }).value()

  return filtered
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
