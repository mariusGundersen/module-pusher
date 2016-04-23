import dep3 from 'modules/dep3.js';
import dep4 from 'modules/dep4.js';

export class Page2 {
  constructor() {
    console.log('Page2', dep3(), dep4());
  }
}