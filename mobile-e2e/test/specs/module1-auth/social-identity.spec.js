const { byText } = require('appium-flutter-finder');
//
describe('Social Tests', () => {
    it('finds Google', async () => {
        const t1 = byText('Continue with Google');
        const t2 = byText('Google');
        try {
            await browser.execute('flutter:waitFor', t1, 3000);
        } catch (e) {
            await browser.execute('flutter:waitFor', t2, 3000);
        }
    });
});
