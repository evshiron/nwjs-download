
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

require('babel-polyfill');

var _require = require('path');

var dirname = _require.dirname;
var basename = _require.basename;
var join = _require.join;

var _require2 = require('fs');

var exists = _require2.exists;
var writeFile = _require2.writeFile;

var _require3 = require('util');

var deprecate = _require3.deprecate;


var Flow = require('node-flow');

var _require4 = require('./util');

var GetManifest = _require4.GetManifest;
var ClearManifestCache = _require4.ClearManifestCache;
var Download = _require4.Download;


var EXTENSIONS = {
    'win-ia32': '.zip',
    'win-x64': '.zip',
    'linux-ia32': '.tar.gz',
    'linux-x64': '.tar.gz',
    'osx-ia32': '.zip',
    'osx-x64': '.zip'
};

var GetPlatform = function GetPlatform(platform) {

    switch (platform) {
        case 'win':
        case 'windows':
        case 'win32':
            platform = 'win32';
            break;
        case 'linux':
            platform = 'linux';
            break;
        case 'osx':
        case 'macosx':
        case 'darwin':
            platform = 'darwin';
            break;
        default:
            console.warn('WARN_NO_PLATFORM_SPECIFIED');
            console.warn('Use ' + process.platform + '.');
            platform = process.platform;
            break;
    }

    return platform;
};

var GetArch = function GetArch(arch) {

    switch (arch) {
        case 'x86':
        case 'ia32':
            arch = 'ia32';
            break;
        case 'x64':
            arch = 'x64';
            break;
        default:
            console.warn('WARN_NO_ARCH_SPECIFIED');
            console.warn('Use ' + process.arch + '.');
            arch = process.arch;
            break;
    }

    return arch;
};

var GetTarget = function GetTarget(platform, arch) {

    platform = GetPlatform(platform);
    arch = GetArch(arch);

    switch (platform) {
        case 'win32':
            return arch == 'x64' ? 'win-x64' : 'win-ia32';
        case 'linux':
            return arch == 'x64' ? 'linux-x64' : 'linux-ia32';
        case 'darwin':
            return arch == 'x64' ? 'osx-x64' : 'osx-ia32';
    }
};

var GetVersionList = function GetVersionList(callback) {

    GetManifest(function (err, manifest) {

        if (err) {
            return callback(err);
        }

        return callback(null, manifest.versions);
    });
};

var GetLatestVersion = function GetLatestVersion(callback) {

    GetManifest(function (err, manifest) {

        if (err) {
            return callback(err);
        }

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = manifest.versions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var version = _step.value;


                if (version.version == manifest.latest) {

                    return callback(null, version);
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return callback('ERROR_VERSION_NOT_FOUND');
    });
};

var GetStableVersion = function GetStableVersion(callback) {

    GetManifest(function (err, manifest) {

        if (err) {
            return callback(err);
        }

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = manifest.versions[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var version = _step2.value;


                if (version.version == manifest.stable) {

                    return callback(null, version);
                }
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        return callback('ERROR_VERSION_NOT_FOUND');
    });
};

var GetVersion = function GetVersion(version, callback) {

    GetManifest(function (err, manifest) {

        if (err) {
            return callback(err);
        }

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = manifest.versions[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var v = _step3.value;


                if (v.version == version) {

                    return callback(null, v);
                }
            }
        } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                    _iterator3.return();
                }
            } finally {
                if (_didIteratorError3) {
                    throw _iteratorError3;
                }
            }
        }

        return callback('ERROR_VERSION_NOT_FOUND');
    });
};

var DownloadBinary = function DownloadBinary(_ref, callback) {
    var _ref$version = _ref.version;
    var version = _ref$version === undefined ? null : _ref$version;
    var _ref$platform = _ref.platform;
    var platform = _ref$platform === undefined ? null : _ref$platform;
    var _ref$arch = _ref.arch;
    var arch = _ref$arch === undefined ? null : _ref$arch;
    var _ref$flavor = _ref.flavor;
    var flavor = _ref$flavor === undefined ? null : _ref$flavor;
    var _ref$showProgressbar = _ref.showProgressbar;
    var showProgressbar = _ref$showProgressbar === undefined ? false : _ref$showProgressbar;
    var _ref$progressCallback = _ref.progressCallback;
    var progressCallback = _ref$progressCallback === undefined ? null : _ref$progressCallback;


    var debug = require('debug')('NWD:DownloadBinary');

    Flow(regeneratorRuntime.mark(function _callee(cb) {
        var _ref2, _ref3, _err, v, target, url, _ref4, _ref5, err, fromCache, path;

        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (version) {
                            _context.next = 12;
                            break;
                        }

                        _context.next = 3;
                        return GetStableVersion(cb.expect(2));

                    case 3:
                        _ref2 = _context.sent;
                        _ref3 = _slicedToArray(_ref2, 2);
                        _err = _ref3[0];
                        v = _ref3[1];

                        if (!_err) {
                            _context.next = 9;
                            break;
                        }

                        return _context.abrupt('return', callback(_err));

                    case 9:

                        version = v.version;

                        _context.next = 13;
                        break;

                    case 12:
                        if (version.charAt(0) != 'v') {

                            version = 'v' + version;
                        }

                    case 13:
                        target = GetTarget(platform, arch);


                        flavor = flavor ? flavor : 'normal';

                        url = 'http://dl.nwjs.io/' + version + '/nwjs' + (flavor == 'normal' ? '' : '-' + flavor) + '-' + version + '-' + target + EXTENSIONS[target];


                        debug('url:', url);

                        _context.next = 19;
                        return Download(url, {
                            cachePrefix: 'binary',
                            showProgressbar: true,
                            progressCallback: progressCallback
                        }, cb.expect(3));

                    case 19:
                        _ref4 = _context.sent;
                        _ref5 = _slicedToArray(_ref4, 3);
                        err = _ref5[0];
                        fromCache = _ref5[1];
                        path = _ref5[2];


                        callback(err, fromCache, path);

                    case 25:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
};

var DownloadFFmpeg = function DownloadFFmpeg(_ref6, callback) {
    var _ref6$version = _ref6.version;
    var version = _ref6$version === undefined ? null : _ref6$version;
    var _ref6$platform = _ref6.platform;
    var platform = _ref6$platform === undefined ? null : _ref6$platform;
    var _ref6$arch = _ref6.arch;
    var arch = _ref6$arch === undefined ? null : _ref6$arch;
    var _ref6$showProgressbar = _ref6.showProgressbar;
    var showProgressbar = _ref6$showProgressbar === undefined ? false : _ref6$showProgressbar;
    var _ref6$progressCallbac = _ref6.progressCallback;
    var progressCallback = _ref6$progressCallbac === undefined ? null : _ref6$progressCallbac;


    var debug = require('debug')('NWD:DownloadFFmpeg');

    Flow(regeneratorRuntime.mark(function _callee2(cb) {
        var _version, _version2, _err2, v, url, _ref7, _ref8, err, fromCache, path;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if (version) {
                            _context2.next = 10;
                            break;
                        }

                        _context2.next = 3;
                        return GetStableVersion(cb.expect(2));

                    case 3:
                        _version = version = _context2.sent;
                        _version2 = _slicedToArray(_version, 2);
                        _err2 = _version2[0];
                        v = _version2[1];

                        if (!_err2) {
                            _context2.next = 9;
                            break;
                        }

                        return _context2.abrupt('return', callback(_err2));

                    case 9:

                        version = v.version;

                    case 10:

                        version = version.replace(/^v/, '');

                        _context2.t0 = GetPlatform(platform);
                        _context2.next = _context2.t0 === 'win32' ? 14 : _context2.t0 === 'linux' ? 16 : _context2.t0 === 'darwin' ? 18 : 20;
                        break;

                    case 14:
                        platform = 'win';
                        return _context2.abrupt('break', 20);

                    case 16:
                        platform = 'linux';
                        return _context2.abrupt('break', 20);

                    case 18:
                        platform = 'osx';
                        return _context2.abrupt('break', 20);

                    case 20:

                        arch = GetArch(arch);

                        url = 'https://github.com/iteufel/nwjs-ffmpeg-prebuilt/releases/download/' + version + '/' + version + '-' + platform + '-' + arch + '.zip';


                        debug('url:', url);

                        _context2.next = 25;
                        return Download(url, {
                            cachePrefix: 'ffmpeg',
                            showProgressbar: true,
                            progressCallback: progressCallback
                        }, cb.expect(3));

                    case 25:
                        _ref7 = _context2.sent;
                        _ref8 = _slicedToArray(_ref7, 3);
                        err = _ref8[0];
                        fromCache = _ref8[1];
                        path = _ref8[2];


                        callback(err, fromCache, path);

                    case 31:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));
};

Object.assign(module.exports, {
    util: require('./util'),
    commands: require('./commands'),
    GetPlatform: GetPlatform,
    GetArch: GetArch,
    GetTarget: GetTarget,
    GetVersionList: GetVersionList,
    GetLatestVersion: GetLatestVersion,
    GetStableVersion: GetStableVersion,
    GetVersion: GetVersion,
    DownloadBinary: DownloadBinary,
    DownloadFFmpeg: DownloadFFmpeg,
    // Deprecated.
    GetManifest: deprecate(GetManifest, 'GetManifest is deprecated, use util.GetManifest instead.')
});