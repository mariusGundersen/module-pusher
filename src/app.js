
import express from 'express';
import finalhandler from 'finalhandler';
import fs from 'fs-promise';
import glob from 'glob-promise';
import http2 from 'http2';
import Router from 'router';
import moduleTree from './moduleTree';

export default async function(){
  const tryPush = await moduleTree();

  console.log('start');

  var router = new Router();
  router.use(function(req, res, next){
    if (res.push && /^\/modules\/.*\.js$/.test(req.url)) {
      console.log(' ');
      tryPush(req, res);
    }
    next();
  });

  router.use('/node_modules',express.static('node_modules', {
    maxAge: 60*60*24*1000
  }));

  router.use('/',express.static('public/bin', {
    maxAge: 0,
    etag: false
  }));

  router.use('/',express.static('public', {
    maxAge: 0,
    etag: false
  }));

  const [key, cert] = await Promise.all([
    glob('./certs/*.key').then(([key]) => fs.readFile(key)),
    glob('./certs/*.crt').then(([crt]) => fs.readFile(crt))
  ]);

  http2.createServer(
    {
      key,
      cert
    },
    (req, res) => router(req, res, finalhandler(req, res))
  ).listen(process.env.PORT || 8080);
};