var express = require('express');
var app = express();
var path = require('path');
var keys = require('./config.json');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/youtube/:title', function(req, res){
  var formattedKeyword = encodeURIComponent(req.params.title.trim());
  var url = 'https://www.googleapis.com/youtube/v3/search?maxResults=5&part=snippet&q=' + formattedKeyword + '&key=' + keys.google;
  makeRequest(url, function(){
    if(this.status !== 200) 
        return;

    var jsonString = this.responseText;
    res.json(jsonString);
  });
});

app.use(express.static('public'));

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

var makeRequest = function(url, callback){
    var request = new XMLHttpRequest();
    request.open('GET', url);
    request.addEventListener('load', callback);
    request.send();
};