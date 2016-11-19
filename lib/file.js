const fs = require('fs');

module.exports = {
    read : function(state) {
        return new Promise((fulfill, reject) => {
            fs.open(state.fileName, 'r', (err, fd) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        return reject(`ERROR: The file ${state.fileName} does not exist.`);
                    } else {
                        return reject(err);
                    }
                } else {
                    var stream = fs.createReadStream(state.fileName, { fd });
                    var content = '';

                    stream.on('data', (chunk) => {
                        content += chunk;
                    });

                    stream.on('end', () => {
                        return fulfill({ fileName: state.fileName, content });
                    });

                    stream.on('error', (err) => {
                        return reject(err);
                    });
                }
            });
        });
    }
}
