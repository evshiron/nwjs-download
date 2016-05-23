
'use strict';

var NWD = require('../');

var list = function list() {

    NWD.GetVersionList(function (err, versions) {

        if (err) {
            console.error(err);
            return;
        }

        //console.dir(versions);

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = versions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var version = _step.value;


                console.log();
                console.log('version:', version.version);
                console.log.apply(null, ['    targets:', version.files.join(' ')]);
                console.log.apply(null, ['    flavors:', version.flavors.join(' ')]);
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
    });
};

var latest = function latest() {

    NWD.GetLatestVersion(function (err, version) {

        if (err) {
            console.error(err);
            return;
        }

        console.dir(version);
    });
};

var stable = function stable() {

    NWD.GetStableVersion(function (err, version) {

        if (err) {
            console.error(err);
            return;
        }

        console.dir(version);
    });
};

var caches = function caches() {

    NWD.util.GetCacheList(function (err, paths) {

        if (err) {
            console.error(err);
            return;
        }

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = paths[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var path = _step2.value;


                console.log(path);
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
    });
};

var download = function download(command) {

    NWD.DownloadBinary({
        version: typeof command.version == 'string' ? command.version : null,
        platform: command.platform,
        arch: command.arch,
        flavor: command.flavor,
        mirror: command.mirror,
        showProgressbar: true
    }, function (err, fromCache, path) {

        if (err) {
            console.error(err);
            return;
        }

        console.log(fromCache ? 'Cached:' : 'Downloaded:', path);
    });
};

Object.assign(module.exports, {
    list: list,
    latest: latest,
    stable: stable,
    caches: caches,
    download: download
});