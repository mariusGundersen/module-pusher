'use strict';

System.register(['modules/dep3.js', 'modules/dep4.js'], function (_export, _context) {
  var dep3, dep4, Page2;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_modulesDep3Js) {
      dep3 = _modulesDep3Js.default;
    }, function (_modulesDep4Js) {
      dep4 = _modulesDep4Js.default;
    }],
    execute: function () {
      _export('Page2', Page2 = function Page2() {
        _classCallCheck(this, Page2);

        console.log('Page2', dep3(), dep4());
      });

      _export('Page2', Page2);
    }
  };
});
//# sourceMappingURL=page2.js.map
