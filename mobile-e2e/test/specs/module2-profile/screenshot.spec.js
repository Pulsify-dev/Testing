const fs = require('fs');
describe('Screenshot', () => {
  it('should save screenshot', async () => {
    await driver.pause(5000);
    const screenshot = await browser.takeScreenshot();
    fs.writeFileSync('screenshot.png', screenshot, 'base64');
  });
});