#!/usr/bin/env node

'use strict';

const commander = require('commander');

const NWD = require('../');

commander.version(require('../package.json').version);

commander.command('*')
.action(() => commander.help());

commander.command('list')
.action(NWD.commands.list);

commander.command('latest')
.action(NWD.commands.latest);

commander.command('stable')
.action(NWD.commands.stable);

commander.command('caches')
.action(NWD.commands.caches);

commander.command('download')
.option('-v,--version <version>')
.option('-p,--platform <platform>')
.option('-a,--arch <arch>')
.option('-f,--flavor <flavor>')
.option('-m,--mirror <mirror_url>')
.action(NWD.commands.download);

if(process.argv.length <= 2) {
    commander.help();
}

commander.parse(process.argv);
