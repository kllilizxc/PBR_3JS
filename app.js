var express = require('express')
var app = express()

app.use(express.static(__dirname + '/dist'))
app.use(express.static(__dirname + '/shader'))
app.use(express.static(__dirname + '/resources'))

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
});

app.listen(3000, function () {
  console.log('App listening on port 3000!');
});