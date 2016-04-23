import _ from 'lodash';
import fs from 'fs-promise';
import glob from 'glob-promise';
import path from 'path';
import System from 'systemjs';

export default async function(){
  console.log(__dirname);
  const files = await glob('modules/*.js', {cwd:'public'});

  console.log(files);

  System.config({
    baseURL: '/public',
    normalize: name => name,
    locate: load => path.join(process.cwd(), 'public', load.name),
    fetch: path => fs.readFile(path.address, 'utf8')
  });

  await Promise.all(files.map(file => System.import(file)))
  const modules = new Map();
  for(var name in System._loader.moduleRecords){
    var record = System._loader.moduleRecords[name];
    modules.set('/'+name, {
      dependencies: flattenDepTree(record.dependencies.map(x => x.name), System._loader.moduleRecords, [record.name])
      .map(dep => '/'+dep)
    });
  }
  console.log(modules);
  return modules;
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