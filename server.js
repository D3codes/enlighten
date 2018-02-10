var express = require('express')
var path = require('path')
var country = require('countryjs')

var app = express()

app.use('/', (req, res) => {
  var urlParts = req.url.split('/')
  if(urlParts[1] === '' || urlParts[1] === ':1') res.sendFile(path.join(__dirname + '/public/index.html'))
  else if(urlParts[1] === 'country') sendCountryInfo(urlParts, res)
  else if(urlParts[1] === 'assets') res.sendFile(path.join(__dirname + '/assets/'+urlParts[2]))
  else if(urlParts[1] === 'node_modules') res.sendFile(path.join(__dirname + '/node_modules/'+urlParts.splice(2).toString().replace(/,/g, '/')))
  else res.sendFile(path.join(__dirname + '/public/'+urlParts[1]))
})

app.listen(2000)

function sendCountryInfo(url, res) {
  let cid = url[2]
  let info = url[3]
  let cinfo = country.info(cid, 'ISO3')
  res.end(JSON.stringify(cinfo))
}
