const { ancestor, byText, byType } = require('appium-flutter-finder');

const WAIT = {
    short: 2500,
    medium: 5000,
};

async function tap(locator, waitTimeout = WAIT.medium) {
    try {
        await browser.execute('flutter:waitFor', locator, waitTimeout);
        await browser.execute('flutter:clickElement', locator, { timeout: waitTimeout });
    } catch (e) {
        if (e.message.includes('Timeout') || e.message.includes('Future not completed')) {
            await browser.pause(500);
            try {
                await browser.execute('flutter:clickElement', locator, { timeout: waitTimeout });
                return;
            } catch (_) {
            }
        }
        await browser.elementClick(locator);
    }
}

function fieldByHint(hintText) {
    return ancestor({
        of: byText(hintText),
        matching: byType('TextFormField'),
        matchRoot: true,
        firstMatchOnly: true,
    });
}

function fieldByLabel(labelText) {
    return ancestor({
        of: byText(labelText),
        matching: byType('TextFormField'),
        matchRoot: true,
        firstMatchOnly: true,
    });
}

function plainTextFieldByHint(hintText) {
    return ancestor({
        of: byText(hintText),
        matching: byType('TextField'),
        matchRoot: true,
        firstMatchOnly: true,
    });
}

async function tapFirstAvailable(locators, timeoutPerLocator = WAIT.short) {
    let lastError;
    for (const locator of locators) {
        try {
            await tap(locator, timeoutPerLocator);
            return locator;
        } catch (error) {
            lastError = error;
        }
    }
    throw lastError || new Error('No tappable locator matched in time.');
}

async function focusAndEnterText(locators, value, timeoutPerLocator = WAIT.short) {
    await tapFirstAvailable(locators, timeoutPerLocator);
    await browser.execute('flutter:enterText', value);
}

async function waitForAny(
    locators,
    timeoutPerLocator = WAIT.short,
    totalTimeoutMs = timeoutPerLocator * Math.max(1, locators.length),
) {
    const deadline = Date.now() + totalTimeoutMs;
    let lastError;
    while (Date.now() < deadline) {
        for (const locator of locators) {
            try {
                await browser.execute('flutter:waitFor', locator, Math.min(timeoutPerLocator, 700));
                return locator;
            } catch (error) {
                lastError = error;
            }
        }
        await browser.pause(120);
    }
    throw lastError || new Error('None of the expected widgets appeared in time.');
}

async function appears(locator, timeout = WAIT.short) {
    try {
        await browser.execute('flutter:waitFor', locator, timeout);
        return true;
    } catch (_) {
        return false;
    }
}

async function hideKeyboard() {
    try {
        await browser.switchContext('NATIVE_APP');
        await browser.hideKeyboard();
        await browser.switchContext('FLUTTER');
    } catch (e) {
    } finally {
        const context = await browser.getContext();
        if (context !== 'FLUTTER') await browser.switchContext('FLUTTER');
    }
}

module.exports = {
    WAIT,
    tap,
    fieldByHint,
    fieldByLabel,
    plainTextFieldByHint,
    tapFirstAvailable,
    focusAndEnterText,
    waitForAny,
    appears,
    hideKeyboard
};
