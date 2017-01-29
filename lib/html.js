const jsdom = require('jsdom');
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
        jsdom.env(article.body, ["http://code.jquery.com/jquery.js"], (err, window) => {
            if (err) {
                return reject(err);
            }

            try {
                var document = window.document;
                var $ = window.$;
                $('*').each(function(index) {
                    var $this = $(this);

                    switch (this.tagName) {
                        case 'A':
                            var text = $this.text();
                            var href = $this.attr('href');
                            var textNode = document.createTextNode(`[${text}](${href})`);
                            $this.replaceWith(textNode);
                            break;
                        case 'P':
                            $this.append('\n');
                            break;
                    }
                });

                article.body = $(window.document).text();
            } catch (e) {
                return reject(e);
            } finally {
                window.close();
            }

            fulfill(article);
        });
    });
}
