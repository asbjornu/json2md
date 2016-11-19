#!/usr/bin/env node

const textile = require('./lib/textile.js');
const args = require('./lib/args.js');
const file = require('./lib/file.js');

function end(state) {
    console.log(`Done converting ${state.articleCount} articles.`);
}

function error(err) {
    console.error(err);
    process.exit(1);
}

args.validate()
    .then(file.read)
    .then(textile.convert)
    .then(end)
    .catch(error);
