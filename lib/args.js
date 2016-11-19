const argv = require('minimist')(process.argv.slice(2));

module.exports = {
    validate : function () {
        var arguments = argv;

        return new Promise((fulfill, reject) => {
            if (!arguments._ || !Array.isArray(arguments._) || arguments._.length != 1) {
                reject('Usage: json2md.js [/file/to/convert.json]');
            }

            var fileName = arguments._[0];

            fulfill({ fileName });
        });
    }
}
