var _ = require('lodash');
var fs = require('fs');
var glob = require('glob-promise');
var path = require('path');
var System = require('systemjs');

module.exports = function(){
  return glob('modules/*.js', {cwd:'public'})
  .then(files => {
    console.log(files);
    System.config({
      baseURL: '/public',
      normalize: function(name){
        return name;
      },
      locate: function(load){
        return path.join(__dirname,'public', load.name);
      },
      fetch: function(path){
        return new Promise((res, rej) => fs.readFile(path.address, 'utf8', (err, data) => err ? rej(err) : res(data)))
      }
    });

    return Promise.all(files.map(file => System.import(file)))
    .then(function(){
      var modules = Object.create(null);
      for(var i in System._loader.moduleRecords){
        var record = System._loader.moduleRecords[i];
        modules[i] = {dependencies: flattenDepTree(record.dependencies.map(x => x.name), System._loader.moduleRecords, [record.name])};
      }
      console.log(modules);
      return modules;
    }).catch(e => console.error(e.stack));
  });
};

function flattenDepTree(imports, tree, ignore){
  var deps = _.chain(imports)
    .flatMap(imp => tree[imp].dependencies)
    .map(imp => imp.name)
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