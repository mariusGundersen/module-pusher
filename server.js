
var express = require('express');
var finalhandler = require('finalhandler');
var fs = require('fs');
var glob = require('glob-promise');
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
  router.use('/node_modules',express.static('node_modules', {
    maxAge: 60*60*24
  }));
  router.use('/',express.static('public/bin', {
    maxAge: 0,
    etag: false
  }));
  router.use('/',express.static('public', {
    maxAge: 0,
    etag: false
  }));

  return Promise.all([
    glob('./certs/*.key'),
    glob('./certs/*.crt')
  ]).then(arr => ({key: arr[0][0], crt: arr[1][0]}))
  .then(result => {
    const options = {
      key: fs.readFileSync(result.key),
      cert: fs.readFileSync(result.crt)
    };

    http2.createServer(
      options,
      (req, res) => router(req, res, finalhandler(req, res))
    ).listen(process.env.PORT || 8080);
  });
}).catch(e => console.error(e.stack));