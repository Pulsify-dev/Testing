const { browser } = require('@wdio/globals')

module.exports = class Page {

    open (path) {
        return browser.url(`https://the-internet.herokuapp.com/${path}`)
    }
}
