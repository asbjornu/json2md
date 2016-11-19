const php = require('exec-php');
const util = require('util');

module.exports = {
    convert : function(body) {
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
};
