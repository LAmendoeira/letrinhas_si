/*jslint devel: true*/
/*global require*/
var http = require('http');

var _server = require('./server');

http.createServer(function (req, res) {
    
    _server.handleRequest(req, res);
    
}).listen(8888, '127.0.0.1');
console.log('Server running at http://127.0.0.1:8888/');
