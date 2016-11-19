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
    var body = article.body;
    console.log('Converting ' + body.substring(0, 40) + '...');

    return new Promise((fulfill, reject) => {
        console.log('Required PHP');

        php('./textile.php', '/usr/local/bin/php', function(error, textile, output) {
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
