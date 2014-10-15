var express = require('express')
  , store = require('./lib/store')

var app = express()

app.get('/unemployment/current/speedometer', function(req, res){
  store.unemployment.current(function (err, data) {
    if (err) {
      return res.status(500).send(err.toString())
    }

    res.json({
      value: data.current,
      formatted: data.current + '%',
      start: 2,
      end: 20
    })
  })
})

app.get('/unemployment/current/diff', function(req, res){
  store.unemployment.current(function (err, data) {
    if (err) {
      return res.status(500).send(err.toString())
    }

    var diff = data.diff.toFixed(1)
    if (data.diff >= 0) {
      diff = '+' + diff
    }

    res.send(diff + '%')
  })
})

store.start()

var port = process.env.PORT || 5000
app.listen(port)
console.log('Listening on port ' + port)
