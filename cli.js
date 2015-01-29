var yargs = require('yargs')
  , fs = require('fs')
  , parse = require('./lib/parse')
  , cpi = require('./lib/cpi')
  , unemployment = require('./lib/unemployment')
  , dashify = require('./lib/dashify')

var argv = yargs
  .usage('Usage: $0 --infile [/path/to/data-file] --outdir [/path/to/output-directory]')
  .demand(['infile','outdir'])
  .argv

// TODO option to pull from BLS API

var instream = fs.createReadStream(argv.infile)

parse(instream, function (err, data) {
  if (err) {
    return console.log(err)
  }

  var results = unemployment(data)
  dashify.speedometer(fileout('unemployment-speedometer.json'), results, { datatype: 'percent', start: 2, end: 20 })
  dashify.diff(fileout('unemployment-diff.txt'), results, { datatype: 'percent' })
  dashify.history(fileout('unemployment-history.json'), results, { datatype: 'percent' })

  results = cpi(data)
  dashify.speedometer(fileout('cpi-speedometer.json'), results, { start: 180, end: 250 })
  dashify.diff(fileout('cpi-diff.txt'), results)
  dashify.history(fileout('cpi-history.json'), results)
})

function fileout (name) {
  return fs.createWriteStream(argv.outdir + '/' + name)
}