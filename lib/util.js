
'use strict';

const { homedir } = require('os');
const { dirname, join } = require('path');
const { exists, stat, writeFile, readFile, unlink } = require('fs');

const request = require('request');

const Flow = require('node-flow');

const FILE_MANIFEST_CACHE = join(homedir(), '.nwjs-download', 'manifest.json');
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

Object.assign(module.exports, {
    GetManifest,
    ClearManifestCache
});
