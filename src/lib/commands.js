
'use strict';

const NWD = require('../');

const list = () => {

    NWD.GetVersionList((err, versions) => {

        if(err) {
            console.error(err);
            return;
        }

        //console.dir(versions);

        for(let version of versions) {

            console.log();
            console.log('version:', version.version);
            console.log.apply(null, ['    targets:', version.files.join(' ')]);
            console.log.apply(null, ['    flavors:', version.flavors.join(' ')]);

        }

    });

}

const latest = () => {

    NWD.GetLatestVersion((err, version) => {

        if(err) {
            console.error(err);
            return;
        }

        console.dir(version);

    });

};

const stable = () => {

    NWD.GetStableVersion((err, version) => {

        if(err) {
            console.error(err);
            return;
        }

        console.dir(version);

    });

};

const caches = () => {

    NWD.util.GetCacheList((err, paths) => {

        if(err) {
            console.error(err);
            return;
        }

        for(let path of paths) {

            console.log(path);

        }

    });

};

const download = (command) => {

    NWD.DownloadBinary({
        version: typeof command.version == 'string' ? command.version : null,
        platform: command.platform,
        arch: command.arch,
        flavor: command.flavor,
        mirror: command.mirror,
        showProgressbar: true
    }, (err, fromCache, path) => {

        if(err) {
            console.error(err);
            return;
        }

        console.log(fromCache ? 'Cached:' : 'Downloaded:', path);

    });

};

Object.assign(module.exports, {
    list,
    latest,
    stable,
    caches,
    download
});
