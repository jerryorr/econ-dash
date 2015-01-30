var yargs = require('yargs')
  , fs = require('fs')
  , parse = require('./lib/parse')
  , cpi = require('./lib/cpi')
  , unemployment = require('./lib/unemployment')
  , dashify = require('./lib/dashify')
  , request = require('request')
  , bls = require('./lib/bls')
  , _ = require('lodash')
  , moment = require('moment')

var argv = yargs
  .usage('Usage: $0 --infile [/path/to/data-file] --fresh --ids [/path/to/ids.json]')
  .demand(['ids'])
  .check(function (argv) {
    if (!(typeof argv.infile == 'string') && !argv.fresh) {
      throw new Error('Must use --fresh or specify an --infile')
    }
  })
  .argv

var ids = JSON.parse(fs.readFileSync(argv.ids))

var dashid = ids.dashboard

console.log(moment().format(), 'Starting push for dashboard', dashid)

var instream
if (argv.infile) {
  instream = fs.createReadStream(argv.infile)
} else if (argv.fresh) {
  instream = bls()
}

parse(instream, function (err, data) {
  if (err) {
    return console.log(err)
  }

  var results = unemployment(data)

  push(results, unemploymentConfig.diff)
  push(results, unemploymentConfig.speedometer)
  push(results, unemploymentConfig.history)

  results = cpi(data)

  push(results, cpiConfig.diff)
  push(results, cpiConfig.speedometer)
  push(results, cpiConfig.history)
})

function fileout (name) {
  return fs.createWriteStream(argv.outdir + '/' + name)
}

var widgets = ids.widgets

var unemploymentConfig = {
  diff: {
    widget: widgets.unemployment.diff,
    producer: dashify.diff,
    options: {
      datatype: 'percent',
      start: 2,
      end: 20
    }
  },
  speedometer: {
    widget: widgets.unemployment.speedometer,
    producer: dashify.speedometer,
    options: { datatype: 'percent' }
  },
  history: {
    widget: widgets.unemployment.history,
    producer: dashify.history,
    options: { datatype: 'percent', title: 'Unemployment Rate'  }
  }
}


var cpiConfig = {
  diff: {
    widget: widgets.cpi.diff,
    producer: dashify.diff,
    options: {
      start: 180,
      end: 250
    }
  },
  speedometer: {
    widget: widgets.cpi.speedometer,
    producer: dashify.speedometer,
  },
  history: {
    widget: widgets.cpi.history,
    producer: dashify.history,
    options: { title: 'Consumer Price Index'  }
  }
}

function push (results, conf) {
  conf.producer(results, conf.options)
    .pipe(request({
      url: 'https://push.thedash.com/custom/v1/' + dashid + '/' + conf.widget,
      method: 'PUT',
      headers: {
        'content-type': conf.producer.contentType
      }
    }, _.partial(pushDone, conf)))
}

function pushDone (conf, err, response, body) {
  if (err) {
    return logError(err, conf)
  }

  if (response.statusCode != 200) {
    return logError(new Error('HTTP Status: ' + response.statusCode + ', body: ' + body), conf)
  }
}

function logError (err, conf) {
  console.error('Error pushing to', dashid + '/' + conf.widget + ':', err.message)
}
