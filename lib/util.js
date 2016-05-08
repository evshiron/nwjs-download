
'use strict';

const request = require('request');

const GetManifest = (callback) => {

    const url = 'http://nwjs.io/versions.json';

    request(url, {}, (err, res, body) => {

        if(err) {
            return callback(err);
        }

        return callback(null, JSON.parse(body));

    });

};

module.exports = {
    GetManifest
};
