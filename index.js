
'use strict';

const { dirname, basename, join } = require('path');
const { exists, writeFile } = require('fs');
const { mkdirsSync } = require('fs-extra');

const request = require('request');
const wrapProgress = require('request-progress');

const Flow = require('node-flow');

const { GetManifest } = require('./lib/util');

const DIR_CACHES = join(dirname(module.filename), 'caches');
mkdirsSync(DIR_CACHES);

const EXTENSIONS = {
    'win-ia32': '.zip',
    'win-x64': '.zip',
    'linux-ia32': '.tar.gz',
    'linux-x64': '.tar.gz',
    'osx-ia32': '.zip',
    'osx-x64': '.zip'
};

const GetTarget = (platform, arch) => {

    switch(platform) {
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
        console.warn(`Use ${ process.platform }.`);
        platform = process.platform;
    }

    switch(arch) {
    case 'x86':
    case 'ia32':
        arch = 'ia32';
        break;
    case 'x64':
        arch = 'x64';
        break;
    default:
        console.warn('WARN_NO_ARCH_SPECIFIED');
        console.warn(`Use ${ process.arch }.`);
        arch = process.arch;
        break;
    }

    switch(platform) {
    case 'win32':
        return arch == 'x64' ? 'win-x64' : 'win-ia32';
    case 'linux':
        return arch == 'x64' ? 'linux-x64' : 'linux-ia32';
    case 'darwin':
        return arch == 'x64' ? 'osx-x64' : 'osx-ia32';
    }

};

const GetVersionList = (callback) => {

    GetManifest((err, manifest) => {

        if(err) {
            return callback(err);
        }

        return callback(null, manifest.versions);

    });

};

const GetLatestVersion = (callback) => {

    GetManifest((err, manifest) => {

        if(err) {
            return callback(err);
        }

        for(let version of manifest.versions) {

            if(version.version == manifest.latest) {

                return callback(null, version);

            }

        }

        return callback('ERROR_VERSION_NOT_FOUND');

    });

};

const GetStableVersion = (callback) => {

    GetManifest((err, manifest) => {

        if(err) {
            return callback(err);
        }

        for(let version of manifest.versions) {

            if(version.version == manifest.stable) {

                return callback(null, version);

            }

        }

        return callback('ERROR_VERSION_NOT_FOUND');

    });

};

const DownloadBinary = ({
    version = null,
    platform = null,
    arch = null,
    flavor = 'normal',
    progressCallback = null
}, callback) => {

    const debug = require('debug')('NWD:DownloadBinary');

    Flow(function*(cb) {

        if(!version) {

            let [err, v] = yield GetStableVersion((err, version) => cb(err, version));

            if(err) {
                return callback(err);
            }

            version = v.version;

        }
        else if(version.charAt(0) != 'v') {

            version = 'v' + version;

        }

        const target = GetTarget(platform, arch);

        const identity = version + '-' + target + '-' + flavor + EXTENSIONS[target];

        debug('identity:', identity);

        const path = join(DIR_CACHES, identity);

        if(yield exists(path, cb)) {
            return callback(null, true, path);
        }

        const url = `http://dl.nwjs.io/${ version }/nwjs${ flavor == 'normal' ? '' : '-' + flavor}-${ version }-${ target }${ EXTENSIONS[target] }`;

        debug('url:', url);

        var [err, res, body] = yield wrapProgress(request(url, {
            encoding: null
        }, (err, res, body) => cb(err, res, body)))
        .on('progress', (progress) => progressCallback ? progressCallback(Object.assign({}, progress, {
            file: {
                path: path,
                name: basename(path)
            }
        })) : null);

        if(err) {
            return callback(err);
        }

        if(res.statusCode != 200) {
            return callback('ERROR_STATUS_NOT_OK');
        }

        var err = yield writeFile(path, body, {
            encoding: null
        }, cb);

        if(err) {
            return callback(err);
        }

        callback(null, false, path);

    });

};

module.exports = {
    GetVersionList,
    GetLatestVersion,
    GetStableVersion,
    DownloadBinary
};
