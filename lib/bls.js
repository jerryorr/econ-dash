var request = require('request')
  , moment = require('moment')

var series = ['LNS14000000', 'CUUR0000SA0']
  // The BLS will only have data for last month, and if we query
  // for a year that doesn't have data yet, we'll get an error.
  // There still might be a period where we get the error (eg it's
  // February 2015 but the January 2015 data isn't available yet),
  // but I don't care right now
  , end = moment().subtract(1, 'months').format('YYYY')
  , start = (parseInt(end) - 9) + ''

module.exports = function () {
  return request({
    url: 'http://api.bls.gov/publicAPI/v1/timeseries/data/',
    body: {
      seriesid: series,
      startyear: start,
      endyear: end
    },
    method: 'POST',
    json: true
  })
}
