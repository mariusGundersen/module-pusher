'use strict';

System.register(['modules/lib1.js'], function (_export, _context) {
  var lib1;
  return {
    setters: [function (_modulesLib1Js) {
      lib1 = _modulesLib1Js.default;
    }],
    execute: function () {
      _export('default', function () {
        return 'dep1: ' + lib1();
      });
    }
  };
});
//# sourceMappingURL=dep1.js.map