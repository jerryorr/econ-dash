var request = require('request')

var series = ['LNS14000000', 'CUUR0000SA0']
  , start = '2004'
  , end = '2014'
// TODO might need the "try current year, then try previous if it fails" logic

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
