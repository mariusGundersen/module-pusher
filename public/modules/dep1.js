import lib1 from '/modules/lib1.js';

export default () => [
  'dep1',
  ...lib1().map(x => ` ${x}`)
];