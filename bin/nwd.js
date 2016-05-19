#!/usr/bin/env node


'use strict';

var commander = require('commander');

var NWD = require('../');

commander.version(require('../package.json').version);

commander.command('*').action(function () {
    return commander.help();
});

commander.command('list').action(NWD.commands.list);

commander.command('latest').action(NWD.commands.latest);

commander.command('stable').action(NWD.commands.stable);

commander.command('caches').action(NWD.commands.caches);

commander.command('download').option('-v,--version <version>').option('-p,--platform <platform>').option('-a,--arch <arch>').option('-f,--flavor <flavor>').action(NWD.commands.download);

if (process.argv.length <= 2) {
    commander.help();
}

commander.parse(process.argv);