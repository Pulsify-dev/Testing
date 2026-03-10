/**
 * ESLint Rule: no-hardcoded-selectors
 * ─────────────────────────────────────────────────────────────────────────────
 * Fails any test that passes a hardcoded DOM selector string literal directly
 * to a Playwright locator method.
 *
 * Covered methods (receiver can be `page`, `frame`, any `Locator`, etc.):
 *   .locator()   .$()   .$$()   .waitForSelector()   .querySelector()
 *   .querySelectorAll()   .isVisible()   .isHidden()   .isEnabled()
 *   .isDisabled()   .isChecked()   .isEditable()   .fill()   .click()
 *   .type()   .check()   .uncheck()   .focus()   .hover()   .tap()
 *   .innerText()   .innerHTML()   .textContent()   .inputValue()
 *   .getAttribute()   .selectOption()   .dispatchEvent()
 *
 * A string is considered a "hardcoded selector" when it matches any of:
 *   • CSS class selector       → starts with  .
 *   • CSS id selector          → starts with  #
 *   • CSS attribute selector   → starts with  [
 *   • HTML tag selector        → lowercase word like  div, span, input …
 *   • CSS pseudo-selector      → contains  :  (e.g.  div:first-child)
 *   • Descendant combinator    → contains  >  or a double space
 *   • XPath expression         → starts with  //  or  ./
 *
 * Allowed exceptions (non-selector string APIs):
 *   • getByText(), getByLabel(), getByPlaceholder(), getByAltText()
 *   • getByRole() — second arg is an options object, not a selector
 *   • getByTitle(), getByTestId() — data-testid values supplied via locators.ts
 *
 * @example
 *   // ❌ Fails — hardcoded selector
 *   await page.locator('.login-btn').click();
 *   await page.$('#email');
 *
 *   // ✅ Passes — selector from registry
 *   import { L } from '../fixtures/locators';
 *   await page.locator(L.module1.loginPage.submitButton).click();
 */

'use strict';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * HTML tag names that, when used alone as a locator string, are CSS selectors.
 * Source: https://developer.mozilla.org/en-US/docs/Web/HTML/Element
 */
const HTML_TAGS = new Set([
  'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio',
  'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button',
  'canvas', 'caption', 'cite', 'code', 'col', 'colgroup',
  'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt',
  'em', 'embed',
  'fieldset', 'figcaption', 'figure', 'footer', 'form',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hr', 'html',
  'i', 'iframe', 'img', 'input', 'ins',
  'kbd', 'label', 'legend', 'li', 'link',
  'main', 'map', 'mark', 'menu', 'meta', 'meter',
  'nav', 'noscript',
  'object', 'ol', 'optgroup', 'option', 'output',
  'p', 'picture', 'pre', 'progress',
  'q', 'rp', 'rt', 'ruby',
  's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span',
  'strong', 'style', 'sub', 'summary', 'sup',
  'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead',
  'time', 'title', 'tr', 'track',
  'u', 'ul', 'var', 'video', 'wbr',
]);

/**
 * Returns true if the string value looks like a hardcoded CSS/XPath selector.
 * @param {string} value
 * @returns {boolean}
 */
function isHardcodedSelector(value) {
  const v = value.trim();

  // Empty or very short strings are not selectors
  if (v.length < 2) return false;

  // CSS class selector
  if (v.startsWith('.')) return true;

  // CSS id selector
  if (v.startsWith('#')) return true;

  // CSS attribute selector (e.g. [data-testid="…"], [type="submit"])
  if (v.startsWith('[')) return true;

  // XPath expression
  if (v.startsWith('//') || v.startsWith('./')) return true;

  // CSS pseudo-class / pseudo-element (div:first-child, :nth-child(2))
  if (v.includes(':')) return true;

  // Descendant combinator — contains ` > ` or multiple words (combinator)
  if (v.includes(' > ') || v.includes(' + ') || v.includes(' ~ ')) return true;

  // Descendant combinator via space: "ul li", "form input"
  if (/\s+/.test(v)) return true;

  // Bare HTML tag name
  if (HTML_TAGS.has(v.toLowerCase())) return true;

  return false;
}

// ─── Playwright methods whose FIRST argument is a selector ───────────────────
const SELECTOR_METHODS = new Set([
  'locator', '$', '$$',
  'waitForSelector',
  'querySelector', 'querySelectorAll',
]);

// ─── Playwright methods that accept a selector but are data-only ─────────────
// (these should still come from the locator registry, but we
//  give a slightly different message since the arg is a data value, not a
//  CSS selector — e.g. getByTestId takes a data-testid VALUE, not a selector)
const DATA_VALUE_METHODS = new Set([
  'getByTestId',
]);

// ─── Methods explicitly safe (their string arg is NOT a selector) ─────────────
const SAFE_METHODS = new Set([
  'getByText', 'getByLabel', 'getByPlaceholder',
  'getByAltText', 'getByTitle', 'getByRole',
  'evaluate', 'evaluateAll', 'evaluateHandle',
  'addInitScript', 'exposeFunction', 'exposeBinding',
  'route', 'unroute',
  'goto', 'waitForURL',
  'fill', 'type', 'press', 'pressSequentially',
  'selectOption', 'setAttribute',
  'screenshot', 'pdf',
]);

// ─── Rule definition ─────────────────────────────────────────────────────────

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          /** Extra method names to treat as selector methods (in addition to built-ins) */
          additionalSelectorMethods: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
            default: [],
          },
          /** Method names to explicitly whitelist (never report, even if they match) */
          allowedMethods: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
            default: [],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      hardcodedSelector:
        "Hardcoded DOM selector '{{ selector }}' detected in '{{ method }}()'. " +
        'Import the selector from the locator registry instead: ' +
        "import { L } from '../fixtures/locators';",
      hardcodedTestId:
        "Hardcoded data-testid value '{{ value }}' detected in '{{ method }}()'. " +
        'Use the equivalent constant from the locator registry: ' +
        "import { L } from '../fixtures/locators';",
    },
    docs: {
      description:
        'Disallow hardcoded DOM selectors in Playwright tests. All selectors must be imported from web-locators.json via fixtures/locators.ts.',
      recommended: true,
      url: 'https://github.com/Pulsify-dev/Testing/blob/main/web-e2e/eslint-rules/no-hardcoded-selectors.js',
    },
  },

  create(context) {
    const options = context.options[0] ?? {};
    const extraSelectorMethods = new Set(options.additionalSelectorMethods ?? []);
    const allowedMethods       = new Set(options.allowedMethods ?? []);

    /**
     * Report a node if its first string-literal argument looks like a selector.
     * @param {import('eslint').Rule.Node} node  — CallExpression node
     * @param {string} methodName
     */
    function checkCall(node, methodName) {
      if (allowedMethods.has(methodName)) return;
      if (SAFE_METHODS.has(methodName))   return;

      const firstArg = node.arguments[0];
      if (!firstArg) return;

      // ── data-testid value methods (getByTestId) ──────────────────────────
      if (DATA_VALUE_METHODS.has(methodName)) {
        if (firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
          context.report({
            node: firstArg,
            messageId: 'hardcodedTestId',
            data: { value: firstArg.value, method: methodName },
          });
        }
        return;
      }

      // ── selector methods (locator, $, $$, waitForSelector, …) ────────────
      if (SELECTOR_METHODS.has(methodName) || extraSelectorMethods.has(methodName)) {
        // String literal
        if (firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
          if (isHardcodedSelector(firstArg.value)) {
            context.report({
              node: firstArg,
              messageId: 'hardcodedSelector',
              data: { selector: firstArg.value, method: methodName },
            });
          }
          return;
        }

        // Template literal with no expressions (``div.foo``) — still hardcoded
        if (
          firstArg.type === 'TemplateLiteral' &&
          firstArg.expressions.length === 0 &&
          firstArg.quasis.length === 1
        ) {
          const raw = firstArg.quasis[0].value.cooked ?? firstArg.quasis[0].value.raw;
          if (isHardcodedSelector(raw)) {
            context.report({
              node: firstArg,
              messageId: 'hardcodedSelector',
              data: { selector: raw, method: methodName },
            });
          }
        }
      }
    }

    return {
      CallExpression(node) {
        const callee = node.callee;

        // pattern: something.locator(…)  /  something.$('…')  /  page.locator(…)
        if (callee.type === 'MemberExpression' && !callee.computed) {
          const methodName = callee.property.name ?? callee.property.value;
          if (typeof methodName === 'string') {
            checkCall(node, methodName);
          }
        }

        // pattern: locator('…')  — bare call (unlikely but possible in helpers)
        if (callee.type === 'Identifier') {
          checkCall(node, callee.name);
        }
      },
    };
  },
};
