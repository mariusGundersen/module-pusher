import {BloomFilter} from 'bloomfilter';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import analyze from './analyze';

export default async function(){
  const depTree = await analyze();
  return function tryPush(req, res){
    try{
      const moduleName = req.url.substr(1);
      console.log('moduleName', moduleName);
      if(! depTree.has(moduleName)){
        return;
      }

      const module = depTree.get(moduleName);

      const hex = req.headers['bloom-filter'];
      const bloomArray = _.chain(hex)
        .split('')
        .chunk(8)
        .map(x => x.join(''))
        .map(x => parseInt(x, 16))
        .value();
      console.log(moduleName, hex);
      const bf = new BloomFilter(bloomArray, 6);
      const deps = module.dependencies;
      deps.forEach(dep => {
        const hasDep = bf.test('/'+dep);
        console.log('has', dep, hasDep);
        if(!hasDep){
          try{
            console.log('pushing', dep);
            const push = res.push('/'+dep);
            push.setHeader('content-type', 'application/javascript');
            push.writeHead(200);
            fs.createReadStream(path.join(process.cwd(), 'public', dep)).pipe(push);
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