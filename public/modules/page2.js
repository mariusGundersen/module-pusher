import dep3 from '/modules/dep3.js';
import dep4 from '/modules/dep4.js';

export const getDeps = () => [
  'page2',
  ...dep3().map(x => ` ${x}`),
  ...dep4().map(x => ` ${x}`)
];
document.querySelector('pre').innerText += getDeps().join('\n') + '\n' + window.performance.now();