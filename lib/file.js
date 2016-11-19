const fs = require('fs');

module.exports = {
    read : function(state) {
        return new Promise((fulfill, reject) => {
            fs.open(state.fileName, 'r', (err, fd) => {
                if (err) {
                    if (err.code === 'ENOENT') {
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
}
