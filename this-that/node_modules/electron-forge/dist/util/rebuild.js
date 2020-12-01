'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _bluebird = require('bluebird');

var _electronRebuild = require('electron-rebuild');

var _electronRebuild2 = _interopRequireDefault(_electronRebuild);

var _oraHandler = require('../util/ora-handler');

var _oraHandler2 = _interopRequireDefault(_oraHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (() => {
  var _ref = (0, _bluebird.coroutine)(function* (buildPath, electronVersion, platform, arch, config = {}) {
    if (!electronVersion) {
      throw new Error("Could not determine Electron version. Make sure that 'npm install' (or 'yarn') has been run before invoking electron-forge.");
    }

    yield (0, _oraHandler2.default)('Preparing native dependencies', (() => {
      var _ref2 = (0, _bluebird.coroutine)(function* (rebuildSpinner) {
        const rebuilder = (0, _electronRebuild2.default)((0, _assign2.default)({}, config, {
          buildPath,
          electronVersion,
          arch
        }));
        const lifecycle = rebuilder.lifecycle;


        let found = 0;
        let done = 0;

        const redraw = function redraw() {
          rebuildSpinner.text = `Preparing native dependencies: ${done} / ${found}`; // eslint-disable-line
        };

        lifecycle.on('module-found', function () {
          found += 1;redraw();
        });
        lifecycle.on('module-done', function () {
          done += 1;redraw();
        });

        yield rebuilder;
      });

      return function (_x5) {
        return _ref2.apply(this, arguments);
      };
    })());
  });

  return function (_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWwvcmVidWlsZC5qcyJdLCJuYW1lcyI6WyJidWlsZFBhdGgiLCJlbGVjdHJvblZlcnNpb24iLCJwbGF0Zm9ybSIsImFyY2giLCJjb25maWciLCJFcnJvciIsInJlYnVpbGRTcGlubmVyIiwicmVidWlsZGVyIiwibGlmZWN5Y2xlIiwiZm91bmQiLCJkb25lIiwicmVkcmF3IiwidGV4dCIsIm9uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUVBOzs7Ozs7O3NDQUVlLFdBQU9BLFNBQVAsRUFBa0JDLGVBQWxCLEVBQW1DQyxRQUFuQyxFQUE2Q0MsSUFBN0MsRUFBbURDLFNBQVMsRUFBNUQsRUFBbUU7QUFDaEYsUUFBSSxDQUFDSCxlQUFMLEVBQXNCO0FBQ3BCLFlBQU0sSUFBSUksS0FBSixDQUFVLDZIQUFWLENBQU47QUFDRDs7QUFFRCxVQUFNLDBCQUFTLCtCQUFUO0FBQUEsMkNBQTBDLFdBQU9DLGNBQVAsRUFBMEI7QUFDeEUsY0FBTUMsWUFBWSwrQkFBUSxzQkFBYyxFQUFkLEVBQWtCSCxNQUFsQixFQUEwQjtBQUNsREosbUJBRGtEO0FBRWxEQyx5QkFGa0Q7QUFHbERFO0FBSGtELFNBQTFCLENBQVIsQ0FBbEI7QUFEd0UsY0FNaEVLLFNBTmdFLEdBTWxERCxTQU5rRCxDQU1oRUMsU0FOZ0U7OztBQVF4RSxZQUFJQyxRQUFRLENBQVo7QUFDQSxZQUFJQyxPQUFPLENBQVg7O0FBRUEsY0FBTUMsU0FBUyxTQUFUQSxNQUFTLEdBQU07QUFDbkJMLHlCQUFlTSxJQUFmLEdBQXVCLGtDQUFpQ0YsSUFBSyxNQUFLRCxLQUFNLEVBQXhFLENBRG1CLENBQ3dEO0FBQzVFLFNBRkQ7O0FBSUFELGtCQUFVSyxFQUFWLENBQWEsY0FBYixFQUE2QixZQUFNO0FBQUVKLG1CQUFTLENBQVQsQ0FBWUU7QUFBVyxTQUE1RDtBQUNBSCxrQkFBVUssRUFBVixDQUFhLGFBQWIsRUFBNEIsWUFBTTtBQUFFSCxrQkFBUSxDQUFSLENBQVdDO0FBQVcsU0FBMUQ7O0FBRUEsY0FBTUosU0FBTjtBQUNELE9BbkJLOztBQUFBO0FBQUE7QUFBQTtBQUFBLFNBQU47QUFvQkQsRyIsImZpbGUiOiJ1dGlsL3JlYnVpbGQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcmVidWlsZCBmcm9tICdlbGVjdHJvbi1yZWJ1aWxkJztcblxuaW1wb3J0IGFzeW5jT3JhIGZyb20gJy4uL3V0aWwvb3JhLWhhbmRsZXInO1xuXG5leHBvcnQgZGVmYXVsdCBhc3luYyAoYnVpbGRQYXRoLCBlbGVjdHJvblZlcnNpb24sIHBsYXRmb3JtLCBhcmNoLCBjb25maWcgPSB7fSkgPT4ge1xuICBpZiAoIWVsZWN0cm9uVmVyc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCBkZXRlcm1pbmUgRWxlY3Ryb24gdmVyc2lvbi4gTWFrZSBzdXJlIHRoYXQgJ25wbSBpbnN0YWxsJyAob3IgJ3lhcm4nKSBoYXMgYmVlbiBydW4gYmVmb3JlIGludm9raW5nIGVsZWN0cm9uLWZvcmdlLlwiKTtcbiAgfVxuXG4gIGF3YWl0IGFzeW5jT3JhKCdQcmVwYXJpbmcgbmF0aXZlIGRlcGVuZGVuY2llcycsIGFzeW5jIChyZWJ1aWxkU3Bpbm5lcikgPT4ge1xuICAgIGNvbnN0IHJlYnVpbGRlciA9IHJlYnVpbGQoT2JqZWN0LmFzc2lnbih7fSwgY29uZmlnLCB7XG4gICAgICBidWlsZFBhdGgsXG4gICAgICBlbGVjdHJvblZlcnNpb24sXG4gICAgICBhcmNoLFxuICAgIH0pKTtcbiAgICBjb25zdCB7IGxpZmVjeWNsZSB9ID0gcmVidWlsZGVyO1xuXG4gICAgbGV0IGZvdW5kID0gMDtcbiAgICBsZXQgZG9uZSA9IDA7XG5cbiAgICBjb25zdCByZWRyYXcgPSAoKSA9PiB7XG4gICAgICByZWJ1aWxkU3Bpbm5lci50ZXh0ID0gYFByZXBhcmluZyBuYXRpdmUgZGVwZW5kZW5jaWVzOiAke2RvbmV9IC8gJHtmb3VuZH1gOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgfTtcblxuICAgIGxpZmVjeWNsZS5vbignbW9kdWxlLWZvdW5kJywgKCkgPT4geyBmb3VuZCArPSAxOyByZWRyYXcoKTsgfSk7XG4gICAgbGlmZWN5Y2xlLm9uKCdtb2R1bGUtZG9uZScsICgpID0+IHsgZG9uZSArPSAxOyByZWRyYXcoKTsgfSk7XG5cbiAgICBhd2FpdCByZWJ1aWxkZXI7XG4gIH0pO1xufTtcbiJdfQ==