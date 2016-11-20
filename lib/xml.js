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
    console.log('Converting ' + article.title);

    return new Promise((fulfill, reject) => {
        jsdom.env(article.body, ["http://code.jquery.com/jquery.js"], (err, window) => {
            if (err) {
                return reject(err);
            }

            try {
                var elements = document.querySelectorAll('*');

                // console.log(util.inspect(elements));

                for (let element of elements) {
                    console.log(element.tagName);

                    switch (element.tagName) {
                        case 'A':
                            var textNode = document.createTextNode(`[${element.innerText}](${element.attributes.href})`);
                            element.parentNode.replaceChild(element, textNode);
                            break;
                    }
                }
            } catch (e) {
                reject(e);
            } finally {
                window.close();
            }
        });
    });
}
