import dep1 from 'modules/dep1.js';
import dep2 from 'modules/dep2.js';

export class Page1 {
  constructor() {
    console.log('Page1', dep1(), dep2());
  }
}