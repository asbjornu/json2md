#!/usr/bin/env node

const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));

var validate = new Promise((fulfill, reject) => {
    if (!argv._ || !Array.isArray(argv._) || argv._.length != 1) {
        reject("Usage: json2md.js [/file/to/convert.json]");
    }

    var file = argv._[0];

    console.log("Converting:", file);

    fulfill(file);
});

function read(file) {
    return new Promise((fulfill, reject) => {
        fs.open(file, 'r', (err, fd) => {
            if (err) {
                if (err.code === "ENOENT") {
                    reject("ERROR: The file does not exist.");
                } else {
                    reject(err);
                }
            } else {
                var stream = fs.createReadStream(file, { fd: fd });
                var content = '';

                stream.on('data', (chunk) => {
                    content += chunk;
                });

                stream.on('end', () => {
                    fulfill(content);
                });
            }
        });
    });
}

function convert(content) {
    return new Promise((fulfill, reject) => {
        var json = JSON.parse(content);

        if (!Array.isArray(json)) {
            reject("Not an array")
        }

        fulfill(json.length);
    });
}

function end(length) {
    console.log("Done!", length);
}

function error(err) {
    console.error(err);
    process.exit(1);
}

validate
    .then(read)
    .then(convert)
    .then(end)
    .catch(error);
