var Bloomfilter = require('bloomfilter').BloomFilter;
var express = require('express');
var finalhandler = require('finalhandler');
var fs = require('fs');
var http2 = require('http2');
var Router = require('router');

express.static.mime.define({'application/javascript': ['js']});

var router = new Router();
router.use(function(req, res, next){
  if(req.url.includes('/modules/')){
    console.log(req.url, req.headers['bloom-filter']);
    var bf = new Bloomfilter(JSON.parse(req.headers['bloom-filter'] || []), 6);
    console.log('has dep1.js', bf.test("/modules/dep1.js"));
  }
  next();
});
router.use('/node_modules',express.static('node_modules', {
  maxAge: 0
}));
router.use('/',express.static('public'));
router.get('/test', function (req, res) {
    console.log(req.headers);
    console.log(res.push);
    res.setHeader('Content-type', 'text/html');
    return res.end('<h1>Hello, Secure World!</h1>');
});
var options = {
  key: fs.readFileSync('./certs/localhost.key'),
  cert: fs.readFileSync('./certs/localhost.crt')
};

http2.createServer(options, app).listen(8080);
function app(req, res) {
    router(req, res, finalhandler(req, res));
}