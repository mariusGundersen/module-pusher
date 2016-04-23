var Bloomfilter = require('bloomfilter').BloomFilter;
var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var analyze = require('./analyze');

module.exports = function(){
  return analyze().then(function(depTree){
    return function tryPush(req, res){
      try{
        var moduleName = req.url.substr(1);
        console.log('moduleName', moduleName);
        var module = depTree[moduleName];
        if(module == null){
          return
        }

        var hex = req.headers['bloom-filter'];
        var bloomArray = _.chain(hex)
          .split('')
          .chunk(8)
          .map(x => x.join(''))
          .map(x => parseInt(x, 16))
          .value();
        console.log(moduleName, hex);
        var bf = new Bloomfilter(bloomArray, 6);
        var deps = module.dependencies;
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
  });
}