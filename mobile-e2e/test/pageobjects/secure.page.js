const { $ } = require('@wdio/globals')
const Page = require('./page');

class SecurePage extends Page {

    get flashAlert () {
        return $('#flash');
    }
}

module.exports = new SecurePage();
