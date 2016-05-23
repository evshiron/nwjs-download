
const cp = require('child_process');

describe('nwd', function() {

    describe('download', function() {

        this.timeout(120000);

        it('should print the stable version and exit with code 0', function(done) {

            cp.exec('node ./bin/nwd.js stable', function(err, stdout, stderr) {

                console.log(stdout);
                console.log(stderr);

                if(err) throw err;

                done();

            });

        });

        it('should download the stable version and exit with code 0', function(done) {

            cp.exec('node ./bin/nwd.js download', function(err, stdout, stderr) {

                console.log(stdout);
                console.log(stderr);

                if(err) throw err;

                done();

            });

        });

    });

});
