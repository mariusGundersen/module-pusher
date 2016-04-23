'use strict';

System.register(['modules/lib2.js'], function (_export, _context) {
  var lib2;
  return {
    setters: [function (_modulesLib2Js) {
      lib2 = _modulesLib2Js.default;
    }],
    execute: function () {
      _export('default', function () {
        return 'dep2: ' + lib2();
      });
    }
  };
});
//# sourceMappingURL=dep2.js.map