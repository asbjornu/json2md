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
                state.articles = articles;
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

            var content = '# ' + article.title.trim()
                        + '\n\n'
                        + wrap(article.body).trim()
                        + '\n\n'
                        + wrap(article.extended_body).trim();

            stream.write(content);
            stream.end();

            if (state.verbose) {
                console.log(`Wrote ${article.fileName}`);
            }

            fulfill(state);
        });
    });
}

function wrap(text, lineLength) {
    lineLength = lineLength || 78;

    if (!text || text.length <= lineLength) {
        return text;
    }

    var result = '';
    var line = '';
    var word = '';
    var newLines = 0;

    for (var i = 0; i < text.length; i++) {
        var char = text[i];

        switch (char) {
            case '\t':
            case ' ':
                newLines = 0;
                if (line.length > 0 && (line.length + word.length) > lineLength) {
                    result += line.trim() + '\n';
                    line = word.trim() + ' ';
                    word = '';
                    break;
                }
                line += word.trim() + ' ';
                word = '';
                break;

            case '\n':
                if (newLines++ >= 2) {
                    newLines = 0;
                    break;
                }
                result += line.trim() + ' ' + word.trim() + '\n';
                line = '';
                word = '';
                break;

            default:
                newLines = 0;
                word += char;
                break;
        }
    }

    if (word.length > 0) {
        line += word.trim();
    }

    if (line.length > 0) {
        result += line.trim() + '\n';
    }

    return result;
}
