var express = require('express')
  , u = require('./lib/unemployment')

var app = express()

app.get('/unemployment/current/speedometer', function(req, res){
  u.current(function (err, data) {
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
  u.current(function (err, data) {
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

app.listen(3000)
