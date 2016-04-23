import {BloomFilter} from 'bloomfilter';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import analyze from './analyze';

export default async function(){
  const depTree = await analyze();
  return function tryPush(req, res){
    try{
      const moduleName = req.url;
      console.log('⇒', moduleName);
      if(!depTree.has(moduleName)){
        return;
      }

      const hex = req.headers['bloom-filter'];
      console.log('hex:', hex);
      const bf = getBloomFilter(hex);

      const module = depTree.get(moduleName);
      const deps = module.dependencies.map(dep => ({
        name: dep,
        has: bf.test(dep)
      }));

      for(const {name, has} of deps){
        console.log(' ', has ? '✔' : '✘', name);
      }

      console.log('⇐', moduleName);
      deps.filter(d => !d.has).forEach(({name}) => {
        try{
          console.log('⇐', name);
          const push = res.push(name);
          push.setHeader('content-type', 'application/javascript');
          push.writeHead(200);
          fs.createReadStream(path.join(process.cwd(), 'public', name)).pipe(push);
        }catch(e){
          console.error(e.stack || e);
        }
      });
    }catch(e){
      console.error(e.stack || e);
    }
  }
};

function getBloomFilter(hex){
  const bloomArray = _.chain(hex)
    .split('|')
    .map(x => parseInt(x, 16))
    .value();
  return new BloomFilter(bloomArray, 6);
}