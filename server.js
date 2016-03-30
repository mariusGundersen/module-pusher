
var express = require('express');
var finalhandler = require('finalhandler');
var fs = require('fs');
var http2 = require('http2');
var Router = require('router');
var moduleTree = require('./moduleTree');

moduleTree().then(function(tryPush){
  console.log('start');
  var router = new Router();
  router.use(function(req, res, next){
    if (res.push && req.url.includes('/modules/')) {
    console.log(req.url);
      tryPush(req, res);
    }
    next();
  });
  router.use('/node_modules',express.static('node_modules'));
  router.use('/',express.static('public', {
    maxAge: 0
  }));

  var options = {
    key: fs.readFileSync('./certs/localhost.key'),
    cert: fs.readFileSync('./certs/localhost.crt')
  };

  http2.createServer(options, (req, res) => router(req, res, finalhandler(req, res))).listen(process.env.PORT || 8080);
}).catch(e => console.error(e.stack));