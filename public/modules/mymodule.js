'use strict';

System.register(['modules/dep1.js', 'modules/dep2.js'], function (_export, _context) {
  var dep1, dep2, q;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_modulesDep1Js) {
      dep1 = _modulesDep1Js.default;
    }, function (_modulesDep2Js) {
      dep2 = _modulesDep2Js.default;
    }],
    execute: function () {
      _export('q', q = function q() {
        _classCallCheck(this, q);

        console.log('this is an es6 class!', dep1(), dep2());
      });

      _export('q', q);
    }
  };
});
//# sourceMappingURL=mymodule.js.map