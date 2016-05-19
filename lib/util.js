
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _require = require('os');

var homedir = _require.homedir;

var _require2 = require('path');

var dirname = _require2.dirname;
var basename = _require2.basename;
var join = _require2.join;
var resolve = _require2.resolve;

var _require3 = require('fs');

var exists = _require3.exists;
var stat = _require3.stat;
var writeFile = _require3.writeFile;
var readFile = _require3.readFile;
var unlink = _require3.unlink;
var readdir = _require3.readdir;

var _require4 = require('fs-extra');

var mkdirsSync = _require4.mkdirsSync;


var temp = require('temp');

var request = require('request');
var wrapProgress = require('request-progress');

var ProgressBar = require('progress');

var Flow = require('node-flow');

var DIR_CACHES = join(homedir(), '.nwjs-download', 'caches');
mkdirsSync(DIR_CACHES);

var FILE_MANIFEST_CACHE = join(DIR_CACHES, 'manifest.json');
var EXPIRY_MANIFEST_CACHE = 3600000;

var GetManifest = function GetManifest(callback) {

    var debug = require('debug')('NWD:GetManifest');

    Flow(regeneratorRuntime.mark(function _callee(cb) {
        var cacheExists, useCache, _ref, _ref2, err, cacheStat, _ref3, _ref4, _err, data, url, _ref5, _ref6, _err2, res, body;

        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return exists(FILE_MANIFEST_CACHE, cb.single);

                    case 2:
                        cacheExists = _context.sent;
                        useCache = false;

                        if (!cacheExists) {
                            _context.next = 13;
                            break;
                        }

                        _context.next = 7;
                        return stat(FILE_MANIFEST_CACHE, cb.expect(2));

                    case 7:
                        _ref = _context.sent;
                        _ref2 = _slicedToArray(_ref, 2);
                        err = _ref2[0];
                        cacheStat = _ref2[1];


                        useCache = !err && Date.now() - cacheStat.ctime.getTime() < EXPIRY_MANIFEST_CACHE;

                        if (!useCache) {
                            debug('Manifest cache expired.');
                        }

                    case 13:
                        if (!true) {
                            _context.next = 48;
                            break;
                        }

                        if (!useCache) {
                            _context.next = 27;
                            break;
                        }

                        debug('Use cached manifest.');

                        _context.next = 18;
                        return readFile(FILE_MANIFEST_CACHE, cb.expect(2));

                    case 18:
                        _ref3 = _context.sent;
                        _ref4 = _slicedToArray(_ref3, 2);
                        _err = _ref4[0];
                        data = _ref4[1];

                        if (!_err) {
                            _context.next = 24;
                            break;
                        }

                        return _context.abrupt('return', callback(_err));

                    case 24:
                        return _context.abrupt('return', callback(null, JSON.parse(data)));

                    case 27:

                        debug('Use online manifest.');

                        url = 'http://nwjs.io/versions.json';
                        _context.next = 31;
                        return request(url, {}, cb.expect(3));

                    case 31:
                        _ref5 = _context.sent;
                        _ref6 = _slicedToArray(_ref5, 3);
                        _err2 = _ref6[0];
                        res = _ref6[1];
                        body = _ref6[2];

                        if (!_err2) {
                            _context.next = 41;
                            break;
                        }

                        console.trace(_err2);
                        console.warn('Fail back to cached manifest.');

                        useCache = true;
                        return _context.abrupt('continue', 13);

                    case 41:
                        _context.next = 43;
                        return writeFile(FILE_MANIFEST_CACHE, body, cb.single);

                    case 43:
                        _err2 = _context.sent;


                        if (_err2) {
                            // Print and ignore.
                            console.trace(_err2);
                        }

                        return _context.abrupt('return', callback(null, JSON.parse(body)));

                    case 46:
                        _context.next = 13;
                        break;

                    case 48:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
};

var ClearManifestCache = function ClearManifestCache(callback) {
    unlink(FILE_MANIFEST_CACHE, callback);
};

var Download = function Download(url, _ref7, callback) {
    var _ref7$cachePrefix = _ref7.cachePrefix;
    var cachePrefix = _ref7$cachePrefix === undefined ? null : _ref7$cachePrefix;
    var _ref7$showProgressbar = _ref7.showProgressbar;
    var showProgressbar = _ref7$showProgressbar === undefined ? true : _ref7$showProgressbar;
    var _ref7$progressCallbac = _ref7.progressCallback;
    var progressCallback = _ref7$progressCallbac === undefined ? null : _ref7$progressCallbac;


    Flow(regeneratorRuntime.mark(function _callee2(cb) {
        var path, progressbar, _ref8, _ref9, err, res, body;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        path = cachePrefix ? join(DIR_CACHES, cachePrefix + '-' + basename(url)) : temp.path();
                        _context2.next = 3;
                        return exists(path, cb.single);

                    case 3:
                        if (!_context2.sent) {
                            _context2.next = 5;
                            break;
                        }

                        return _context2.abrupt('return', callback(null, true, path));

                    case 5:
                        progressbar = new ProgressBar(':Name [:bar] :Speed :ETA', {
                            width: 20,
                            total: 65535
                        });
                        _context2.next = 8;
                        return wrapProgress(request(url, {
                            encoding: null
                        }, cb.expect(3))).on('progress', function (progress) {

                            if (showProgressbar) {

                                progressbar.curr = progress.size.transferred;
                                progressbar.total = progress.size.total ? progress.size.total : progressbar.curr;

                                progressbar.tick({
                                    Name: basename(path),
                                    Speed: (progress.speed / 1000).toFixed(2) + 'KB/s',
                                    ETA: progress.time.remaining ? progress.time.remaining.toFixed(2) + 's' : '-'
                                });
                            }

                            if (progressCallback) {

                                progressCallback(progress);
                            }
                        });

                    case 8:
                        _ref8 = _context2.sent;
                        _ref9 = _slicedToArray(_ref8, 3);
                        err = _ref9[0];
                        res = _ref9[1];
                        body = _ref9[2];

                        // Fix progressbar output.

                        console.log();

                        if (!err) {
                            _context2.next = 16;
                            break;
                        }

                        return _context2.abrupt('return', callback(err));

                    case 16:
                        if (!(res.statusCode != 200)) {
                            _context2.next = 18;
                            break;
                        }

                        return _context2.abrupt('return', callback(new Error('ERROR_STATUS_NOT_OK')));

                    case 18:
                        _context2.next = 20;
                        return writeFile(path, body, {
                            encoding: null
                        }, cb.single);

                    case 20:
                        err = _context2.sent;

                        if (!err) {
                            _context2.next = 23;
                            break;
                        }

                        return _context2.abrupt('return', callback(err));

                    case 23:

                        callback(null, false, path);

                    case 24:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));
};

var GetCacheList = function GetCacheList(callback) {
    readdir(DIR_CACHES, function (err, files) {

        if (err) {
            return callback(err);
        }

        callback(null, files.map(function (file) {
            return resolve(join(DIR_CACHES, file));
        }));
    });
};

Object.assign(module.exports, {
    GetManifest: GetManifest,
    ClearManifestCache: ClearManifestCache,
    Download: Download,
    GetCacheList: GetCacheList
});