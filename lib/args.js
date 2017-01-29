module.exports = {
    validate : function () {
        return new Promise((fulfill, reject) => {
            var yargs = require('yargs')
              .usage('Usage: $0 [options] [filename]')
              .alias('f', 'force')
              .boolean('force')
              .describe('f', 'Force the processing to continue, even though the file to be saved already exists.')
              .epilog(`Asbjørn Ulsberg © ${new Date().getFullYear()}`)
              .check((arguments, y) => {
                  if (!arguments._ || !Array.isArray(arguments._) || arguments._.length != 1) {
                      throw 'Error: "filename" argument missing';
                  }

                  return true;
              })
              .help();

            var arguments = yargs.argv;

            return fulfill({
                fileName: arguments._[0],
                force: arguments.force
            });
        });
    }
}
