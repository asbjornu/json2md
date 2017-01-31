const jsdom = require('jsdom');
const util = require('util');

module.exports = {
    convertToMarkdown: function(state) {
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
    var convert = html => {
        return new Promise((fulfill, reject) => {
            return jsdom.env(html, ["http://code.jquery.com/jquery.js"], (err, window) => {
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

                            case 'BLOCKQUOTE':
                                var text = $this.text();
                                var textNode = document.createTextNode(`> ${text}`);
                                $this.replaceWith(textNode);
                                break;
                        }
                    });

                    return fulfill($(window.document).text().trim());
                } catch (e) {
                    return reject(e);
                } finally {
                    window.close();
                }
            });
        });
    }

    // TODO: What a bloody mess. Figure out a cleaner way to do this.
    return convert(article.body).then(body => {
        article.body = body;
        return convert(article.extended_body);
    }).then(extendedBody => {
        article.extended_body = extendedBody;

        return new Promise((fulfill, reject) => {
            return fulfill(article);
        });
    });
}
