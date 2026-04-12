const { descendant, byText, byType } = require('appium-flutter-finder');
console.log(JSON.stringify(descendant({
    of: byType('AuthTextField'),
    matching: byType('TextField')
})));
