
'use strict';

const { homedir } = require('os');
const { dirname, basename, join, resolve } = require('path');
const { exists, stat, writeFile, readFile, unlink, readdir } = require('fs');
const { mkdirsSync } = require('fs-extra');

const temp = require('temp');

const request = require('request');
const wrapProgress = require('request-progress');

const ProgressBar = require('progress');

const Flow = require('node-flow');

const DIR_CACHES = join(homedir(), '.nwjs-download', 'caches');
mkdirsSync(DIR_CACHES);

const FILE_MANIFEST_CACHE = join(DIR_CACHES, 'manifest.json');
const EXPIRY_MANIFEST_CACHE = 3600000;

const GetManifest = (callback) => {

    const debug = require('debug')('NWD:GetManifest');

    Flow(function*(cb) {

        const cacheExists = yield exists(FILE_MANIFEST_CACHE, cb.single);

        var useCache = false;

        if(cacheExists) {

            let [err, cacheStat] = yield stat(FILE_MANIFEST_CACHE, cb.expect(2));

            useCache = !err && Date.now() - cacheStat.ctime.getTime() < EXPIRY_MANIFEST_CACHE;

            if(!useCache) {
                debug('Manifest cache expired.');
            }

        }

        if(useCache) {

            debug('Use cached manifest.');

            let [err, data] = yield readFile(FILE_MANIFEST_CACHE, cb.expect(2));

            if(err) {
                return callback(err);
            }

            return callback(null, JSON.parse(data));

        }
        else {

            debug('Use online manifest.');

            let url = 'http://nwjs.io/versions.json';

            let [err, res, body] = yield request(url, {}, cb.expect(3));

            if(err) {
                return callback(err);
            }

            err = yield writeFile(FILE_MANIFEST_CACHE, body, cb.single);

            if(err) {
                return callback(err);
            }

            return callback(null, JSON.parse(body));

        }

    });

};

const ClearManifestCache = (callback) => {
    unlink(FILE_MANIFEST_CACHE, callback);
};

const Download = (url, {
    cachePrefix = null,
    showProgressbar = true,
    progressCallback = null
}, callback) => {

    Flow(function*(cb) {

        const path = cachePrefix ? join(DIR_CACHES, cachePrefix + '-' + basename(url)) : temp.path();

        if(yield exists(path, cb.single)) {
            return callback(null, true, path);
        }

        var progressbar = new ProgressBar(':Name [:bar] :Speed :ETA', {
            width: 20,
            total: 65535
        });

        var [err, res, body] = yield wrapProgress(request(url, {
            encoding: null
        }, cb.expect(3)))
        .on('progress', (progress) => {

            if(showProgressbar) {

                progressbar.curr = progress.size.transferred;
                progressbar.total = progress.size.total ? progress.size.total : progressbar.curr;

                progressbar.tick({
                    Name: basename(path),
                    Speed: (progress.speed / 1000).toFixed(2) + 'KB/s',
                    ETA: progress.time.remaining ? progress.time.remaining.toFixed(2) + 's' : '-'
                });

            }

            if(progressCallback) {

                progressCallback(progress);

            }

        });

        // Fix progressbar output.
        console.log();

        if(err) {
            return callback(err);
        }

        if(res.statusCode != 200) {
            return callback(new Error('ERROR_STATUS_NOT_OK'));
        }

        var err = yield writeFile(path, body, {
            encoding: null
        }, cb.single);

        if(err) {
            return callback(err);
        }

        callback(null, false, path);

    });

};

const GetCacheList = (callback) => {
    readdir(DIR_CACHES, (err, files) => {

        if(err) {
            return callback(err);
        }

        callback(null, files.map((file) => resolve(join(DIR_CACHES, file))));

    });
};

Object.assign(module.exports, {
    GetManifest,
    ClearManifestCache,
    Download,
    GetCacheList
});
