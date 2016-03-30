'use strict';

System.register(['modules/dep2.js'], function (_export, _context) {
  var dep2, Page2;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_modulesDep2Js) {
      dep2 = _modulesDep2Js.default;
    }],
    execute: function () {
      Page2 = function Page2() {
        _classCallCheck(this, Page2);

        console.log('page2', dep2());
      };

      _export('default', Page2);
    }
  };
});
//# sourceMappingURL=page2.js.map