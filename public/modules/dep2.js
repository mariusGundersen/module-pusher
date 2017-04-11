import lib2 from '/modules/lib2.js';

export default () => [
  'dep2',
  ...lib2().map(x => ` ${x}`)
];