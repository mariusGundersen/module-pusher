import dep1 from 'modules/dep1.js';
import dep2 from 'modules/dep2.js';

export default () => [
  'page1',
  ...dep1().map(x => ` ${x}`),
  ...dep2().map(x => ` ${x}`)
];