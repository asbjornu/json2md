#!/usr/bin/env node

const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));
const util = require("util");

function validate(arguments) {
    return new Promise((fulfill, reject) => {
        if (!arguments._ || !Array.isArray(arguments._) || arguments._.length != 1) {
            reject("Usage: json2md.js [/file/to/convert.json]");
        }

        var fileName = arguments._[0];

        fulfill({ fileName });
    });
}

function read(state) {
    return new Promise((fulfill, reject) => {
        fs.open(state.fileName, 'r', (err, fd) => {
            if (err) {
                if (err.code === "ENOENT") {
                    reject(`ERROR: The file ${state.fileName} does not exist.`);
                } else {
                    reject(err);
                }
            } else {
                var stream = fs.createReadStream(state.fileName, { fd });
                var content = '';

                stream.on('data', (chunk) => {
                    content += chunk;
                });

                stream.on('end', () => {
                    fulfill({ fileName: state.fileName, content });
                });

                stream.on('error', (err) => {
                    reject(err);
                });
            }
        });
    });
}

function convertTextile(body) {
    console.log('Converting ' + body.substring(0, 40) + '...');
    return new Promise((fulfill, reject) => {
        var php = require('exec-php');

        console.log('Required PHP');

        php('./lib/textile.php', '/usr/local/bin/php', function(error, textile, output) {
            console.log('Loaded textile.php');

            if (error) {
                return reject(error);
            }

            console.log('Did not receive an error.');

            textile.convert(body, function(error, result, output, printed) {
                console.log(util.inspect({error, result, output, printed}));

                if (error) {
                    return reject('Textile conversion failed.');
                }

                console.log('Conversion success!');

                fulfill(result);
            });
        });
    });
}

function convert(state) {
    return new Promise((fulfill, reject) => {
        var json = JSON.parse(state.content);

        if (!Array.isArray(json)) {
            reject(`ERROR: The file ${state.fileName} needs to be an array.`)
        }

        var converters = json.map(article => convertTextile(article.body));

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

validate(argv)
    .then(read)
    .then(convert)
    .then(end)
    .catch(error);
