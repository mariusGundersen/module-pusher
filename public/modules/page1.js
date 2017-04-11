import dep1 from '/modules/dep1.js';
import dep2 from '/modules/dep2.js';

const getDeps = () => [
  'page1',
  ...dep1().map(x => ` ${x}`),
  ...dep2().map(x => ` ${x}`)
];

document.querySelector('pre').innerText += getDeps().join('\n') + '\n' + window.performance.now();