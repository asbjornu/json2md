#!/usr/bin/env node

const textile = require('./lib/textile.js');
const args = require('./lib/args.js');
const file = require('./lib/file.js');

function convert(state) {
    return new Promise((fulfill, reject) => {
        var json = JSON.parse(state.content);

        if (!Array.isArray(json)) {
            reject(`ERROR: The file ${state.fileName} needs to be an array.`)
        }

        var converters = json.map(article => textile.convert(article.body));

        return Promise.all(converters).then(convertedArticles => {
            fulfill({
                fileName: state.fileName,
                content: state.content,
                articleCount: json.length
            });
        }).catch(code => reject('Converting from Textile failed: ' + code));
    });
}

function end(state) {
    console.log(`Done converting ${state.articleCount} articles.`);
}

function error(err) {
    console.error(err);
    process.exit(1);
}

args.validate()
    .then(file.read)
    .then(convert)
    .then(end)
    .catch(error);
