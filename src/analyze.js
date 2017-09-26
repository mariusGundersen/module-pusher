import _ from 'lodash';
import fs from 'fs-promise';
import glob from 'glob-promise';
import path from 'path';
import precinct from 'precinct';

export default async function(){
  console.log(__dirname);
  const files = await glob('modules/*.js', {cwd:'public'});

  console.log(files);

  const nameAndContent = files.map(async name => {
    const content = await fs.readFile(path.join('public', name), 'utf-8');
    const depTree = precinct(content, {type: 'es6'});
    return ['/'+name, depTree];
  });

  const depLinks = new Map(await Promise.all(nameAndContent));
  const modules = new Map();
  for(var [name, deps] of depLinks){
    modules.set(name, {
      dependencies: flattenDepTree(deps, depLinks, [name])
    });
  }
  console.log(modules);
  return modules;
};

function flattenDepTree(imports, tree, ignore){
  var deps = _.chain(imports)
    .flatMap(imp => tree.get(imp))
    .map(imp => imp)
    .uniq()
    .difference(ignore)
    .value();

  return _.chain(imports)
    .concat(deps)
    .concat(deps.length == 0 ? [] : flattenDepTree(deps, tree, ignore.concat(imports)))
    .uniq()
    .value();
}