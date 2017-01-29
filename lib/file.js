const fs = require('fs');
const path = require('path');
const getSlug = require('speakingurl');

module.exports = {
    read: function(state) {
        return new Promise((fulfill, reject) => {
            fs.open(state.fileName, 'r', (err, fd) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        return reject(`ERROR: The file ${state.fileName} does not exist.`);
                    } else {
                        return reject(err);
                    }
                }

                var stream = fs.createReadStream(state.fileName, { fd });
                var content = '';

                stream.on('data', (chunk) => {
                    content += chunk;
                });

                stream.on('end', () => {
                    state.content = content;
                    return fulfill(state);
                });

                stream.on('error', (err) => {
                    return reject(err);
                });
            });
        });
    },

    save: function(state) {
        return new Promise((fulfill, reject) => {
            var savers = state.articles.map(article => save(state, article));

            return Promise.all(savers).then(articles => {
                return fulfill(state);
            }).catch(err => reject('Saving failed: ' + err));
        });
    }
}


function save(state, article) {
    return new Promise((fulfill, reject) => {
        var directoryPath = path.dirname(state.fileName);
        var fileName = getSlug(article.title) + '.md';
        article.fileName = path.format({
            dir: directoryPath,
            base: fileName
        });

        var flags = state.force ? 'w' : 'wx';

        fs.open(article.fileName, flags, (err, fd) => {
            if (err) {
                if (err.code === "EEXIST") {
                    return reject(`${article.fileName} already exists`);
                } else {
                    return reject(err);
                }
            }

            var stream = fs.createWriteStream(article.fileName, { fd });

            stream.on('error', (err) => {
                return reject(err);
            });

            stream.write('# ' + article.title);
            stream.write('\n\n');
            stream.write(article.body);
            stream.write('\n\n');
            stream.end();

            if (state.verbose) {
                console.log(`Wrote ${article.fileName}`);
            }

            fulfill(state);
        });
    });
}
