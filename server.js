var analyze = require('analyze-es6-modules');
var Bloomfilter = require('bloomfilter').BloomFilter;
var express = require('express');
var finalhandler = require('finalhandler');
var fs = require('fs');
var http2 = require('http2');
var _ = require('lodash');
var path = require('path');
var Router = require('router');

express.static.mime.define({'application/javascript': ['js']});

analyze({
  cwd: path.join(__dirname, '/public/'),
  sources: ['modules/*.js'],
  resolveModulePath: options => /^(.*)\.js$/.exec(options.path)[1],
  fileReader: path => new Promise((res, rej) => fs.readFile(/^(.*)\.js$/.test(path) ? path : path+'.js', (err, data) => err ? rej(err) : res(data)))
}).then(function(result){
  var modules = result.modules.map(module => ({path: module.path, imports: module.imports.map(imp => imp.exportingModule.raw)}));
  var depTree = Object.create(null);
  for(var module of modules){
    depTree[module.path+'.js'] = {
      imports: module.imports
    }
  }
  for(var module of modules){
    depTree[module.path+'.js'].deps = flattenDepTree(module.imports, depTree, [module.path+'.js']);
  }
  console.log(depTree);

  var router = new Router();
  router.use(function(req, res, next){
    if(req.url.includes('/modules/')){
      if (res.push) {
        try{
          var json = req.headers['bloom-filter'];
          console.log(req.url, json);
          var bf = new Bloomfilter(JSON.parse(json || '[]'), 6);
          var deps = depTree[req.url.substr(1)].deps;
          deps.forEach(dep => {
            var hasDep = bf.test('/'+dep);
            console.log('has', dep, hasDep);
            if(!hasDep){
              try{
                console.log('pushing', dep);
                var push = res.push('/'+dep);
                push.setHeader('content-type', 'application/javascript');
                push.writeHead(200);
                fs.createReadStream(path.join(__dirname, '/public/', dep)).pipe(push);
              }catch(e){
                console.error(e.stack || e);
              }
            }
          });
        }catch(e){
          console.error(e.stack || e);
        }
      }
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

  http2.createServer(options, app).listen(443);
  function app(req, res) {
      router(req, res, finalhandler(req, res));
  }

}, e => console.error(e));

function flattenDepTree(imports, tree, ignore){
  var deps = _.chain(imports)
    .flatMap(imp => tree[imp].imports)
    .uniq()
    .difference(ignore)
    .value();
  if(deps.length == 0){
    return _.chain(imports)
      .concat(deps)
      .uniq()
      .value();
  }

  return _.chain(flattenDepTree(deps, tree, ignore.concat(imports)))
    .concat(imports)
    .concat(deps)
    .uniq()
    .value();
}