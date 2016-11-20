const jsdom = require('jsdom');
// const xml = require('node-xml');
const util = require('util');

module.exports = {
    convert: function(state) {
        // console.log(util.inspect(state));

        return new Promise((fulfill, reject) => {
            var converters = state.articles.map(convertHtml);

            return Promise.all(converters).then(articles => {
                state.articles = articles;
                return fulfill(state);
            }).catch(code => reject('Converting from HTML failed: ' + code));
        });
    }
};


function convertHtml(article) {
    return new Promise((fulfill, reject) => {
        jsdom.env({
          html: article.body,
          done: function (err, window) {
              try {
                  var elements = window.document.querySelectorAll('*');

                  console.log(util.inspect(elements));

                  for (let element of elements) {
                  }
              catch (e) {
                  reject(e);
              }
              } finally {
                  window.close();
              }
          }
        });
    });
}

function convertXml(article) {
    return new Promise((fulfill, reject) => {
        var body = '';

        var parser = new xml.SaxParser(function(cb) {
            var link = {
                state : false
            };

            cb.onStartElementNS((element, attrs, prefix, uri, namespaces) => {
                switch (element.toLowerCase()) {
                    case 'a':
                        // console.log(util.inspect(attrs));
                        link.state = true;
                        if (Array.isArray(attrs) && attrs.length == 1 && Array.isArray(attrs[0]) && attrs[0].length == 2 && attrs[0][0] == 'href') {
                            link.href = attrs[0][1];
                            console.log(link.href);
                        }
                        break;
                }
            });

            cb.onEndElementNS((element, prefix, uri) => {
                switch (element.toLowerCase()) {
                    case 'p':
                        body += '\n';
                        break;
                    case 'a':
                        link.state = false;
                        body += `[${link.text}](${link.href})`
                        break;
                }
            });

            cb.onCharacters((chars) => {
                if (link.state) {
                    link.text = chars;
                } else {
                    body += chars;
                }
            });

            cb.onCdata((cdata) => {
                if (link.state) {
                    link.text = cdata;
                } else {
                    body += cdata;
                }
            });

            cb.onWarning((msg) => {
                console.warn('WARNING:' + msg);
            });

            cb.onError((msg) => {
                console.error('ERROR:' + JSON.stringify(msg));
                console.log(article.body);
            });
        });

        parser.parseString('<div>' + article.body + '</div>');

        article.body = body;

        return fulfill(article);
    });

}
