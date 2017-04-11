import dep1 from '/modules/dep1.js';
import dep2 from '/modules/dep2.js';
import dep3 from '/modules/dep3.js';
import dep4 from '/modules/dep4.js';

export const getDeps = () => [
  'page3',
  ...dep1().map(x => ` ${x}`),
  ...dep2().map(x => ` ${x}`),
  ...dep3().map(x => ` ${x}`),
  ...dep4().map(x => ` ${x}`)
];

document.querySelector('pre').innerText += getDeps().join('\n') + '\n' + window.performance.now();