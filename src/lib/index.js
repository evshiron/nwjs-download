
'use strict';

require('babel-polyfill');

const { dirname, basename, join } = require('path');
const { exists, writeFile } = require('fs');
const { deprecate } = require('util');

const Flow = require('node-flow');

const { GetManifest, ClearManifestCache, Download } = require('./util');

const EXTENSIONS = {
    'win-ia32': '.zip',
    'win-x64': '.zip',
    'linux-ia32': '.tar.gz',
    'linux-x64': '.tar.gz',
    'osx-ia32': '.zip',
    'osx-x64': '.zip'
};

const GetPlatform = (platform) => {

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
        break;
    }

    return platform;

};

const GetArch = (arch) => {

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

    return arch;

};

const GetTarget = (platform, arch) => {

    platform = GetPlatform(platform);
    arch = GetArch(arch);

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

const GetVersion = (version, callback) => {

    GetManifest((err, manifest) => {

        if(err) {
            return callback(err);
        }

        for(let v of manifest.versions) {

            if(v.version == version) {

                return callback(null, v);

            }

        }

        return callback('ERROR_VERSION_NOT_FOUND');

    });

};

const DownloadBinary = ({
    version = null,
    platform = null,
    arch = null,
    flavor = null,
    showProgressbar = false,
    progressCallback = null
}, callback) => {

    const debug = require('debug')('NWD:DownloadBinary');

    Flow(function*(cb) {

        if(!version) {

            let [err, v] = yield GetStableVersion(cb.expect(2));

            if(err) {
                return callback(err);
            }

            version = v.version;

        }
        else if(version.charAt(0) != 'v') {

            version = 'v' + version;

        }

        const target = GetTarget(platform, arch);

        flavor = flavor ? flavor : 'normal';

        const url = `http://dl.nwjs.io/${ version }/nwjs${ flavor == 'normal' ? '' : '-' + flavor}-${ version }-${ target }${ EXTENSIONS[target] }`;

        debug('url:', url);

        var [err, fromCache, path] = yield Download(url, {
            cachePrefix: 'binary',
            showProgressbar: true,
            progressCallback: progressCallback
        }, cb.expect(3));

        callback(err, fromCache, path);

    });

};

const DownloadFFmpeg = ({
    version = null,
    platform = null,
    arch = null,
    showProgressbar = false,
    progressCallback = null
}, callback) => {

    const debug = require('debug')('NWD:DownloadFFmpeg');

    Flow(function*(cb) {

        if(!version) {

            let [err, v] = version = yield GetStableVersion(cb.expect(2));

            if(err) {
                return callback(err);
            }

            version = v.version;

        }

        version = version.replace(/^v/, '');

        switch(GetPlatform(platform)) {
        case 'win32':
            platform = 'win';
            break;
        case 'linux':
            platform = 'linux';
            break;
        case 'darwin':
            platform = 'osx';
            break;
        }

        arch = GetArch(arch);

        const url = `https://github.com/iteufel/nwjs-ffmpeg-prebuilt/releases/download/${ version }/${ version }-${ platform }-${ arch }.zip`;

        debug('url:', url);

        var [err, fromCache, path] = yield Download(url, {
            cachePrefix: 'ffmpeg',
            showProgressbar: true,
            progressCallback: progressCallback
        }, cb.expect(3));

        callback(err, fromCache, path);

    });

};

Object.assign(module.exports, {
    util: require('./util'),
    commands: require('./commands'),
    GetPlatform,
    GetArch,
    GetTarget,
    GetVersionList,
    GetLatestVersion,
    GetStableVersion,
    GetVersion,
    DownloadBinary,
    DownloadFFmpeg,
    // Deprecated.
    GetManifest: deprecate(GetManifest, 'GetManifest is deprecated, use util.GetManifest instead.')
});
