'use strict';

System.register(['modules/dep1.js'], function (_export, _context) {
  var dep1;
  return {
    setters: [function (_modulesDep1Js) {
      dep1 = _modulesDep1Js.default;
    }],
    execute: function () {
      _export('default', function () {
        return 'dep2: ' + dep1();
      });
    }
  };
});
//# sourceMappingURL=dep2.js.map