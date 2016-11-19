const php = require('exec-php');
const util = require('util');

module.exports = {
    convert : function(state) {
        return new Promise((fulfill, reject) => {
            var json = JSON.parse(state.content);

            if (!Array.isArray(json)) {
                reject(`ERROR: The file ${state.fileName} needs to be an array.`)
            }

            var converters = json.map(convertTextile);

            return Promise.all(converters).then(convertedArticles => {
                fulfill({
                    fileName: state.fileName,
                    content: state.content,
                    articleCount: json.length
                });
            }).catch(code => reject('Converting from Textile failed: ' + code));
        });
    }
}

function convertTextile(article) {
    var title = article.title.length > 100
        ? article.title.substring(0, 100) + '...'
        : article.title;

    console.log(`Converting '${title}'`);

    return new Promise((fulfill, reject) => {
        php('./textile.php', '/usr/local/bin/php', function(error, textile, output) {
            if (error) {
                return reject(error);
            }

            textile.convert(article.body, function(error, result, output, printed) {
                if (error) {
                    return reject('Textile conversion failed.');
                }

                fulfill(result);
            });
        });
    });
}
