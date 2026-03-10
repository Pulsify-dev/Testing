/**
 * locators.ts — Typed accessor for web-locators.json
 *
 * Import selectors from this module in every test file.
 * NEVER pass raw string literals to page.locator() or page.$().
 *
 * Usage:
 *   import { L } from '../fixtures/locators';
 *   await page.locator(L.module1.loginPage.emailInput).fill('user@example.com');
 */

import registry from '../web-locators.json';

// ─── Internal types derived from the JSON registry ───────────────────────────

type SelectorEntry = { selector: string; description: string };

type PageSelectors<T extends Record<string, { selectors: Record<string, SelectorEntry> }>> = {
  [Page in keyof T]: {
    [Sel in keyof T[Page]['selectors']]: string;
  };
};

// ─── Flatten a page group: { selectorKey: "the-selector-string" } ─────────────

function flattenPage<T extends Record<string, SelectorEntry>>(
  selectors: T,
): { [K in keyof T]: string } {
  return Object.fromEntries(
    Object.entries(selectors).map(([key, entry]) => [key, entry.selector]),
  ) as { [K in keyof T]: string };
}

// ─── Module 1 — Auth ─────────────────────────────────────────────────────────

const auth = {
  loginPage:           flattenPage(registry.modules.module1.pages.loginPage.selectors),
  registerPage:        flattenPage(registry.modules.module1.pages.registerPage.selectors),
  forgotPasswordPage:  flattenPage(registry.modules.module1.pages.forgotPasswordPage.selectors),
  resetPasswordPage:   flattenPage(registry.modules.module1.pages.resetPasswordPage.selectors),
  shared:              flattenPage(registry.modules.module1.pages.shared.selectors),
} as const;

// ─── Module 5 — Playback ─────────────────────────────────────────────────────

const playback = {
  playerBar:           flattenPage(registry.modules.module5.pages.playerBar.selectors),
  fullscreenPlayer:    flattenPage(registry.modules.module5.pages.fullscreenPlayer.selectors),
  queuePanel:          flattenPage(registry.modules.module5.pages.queuePanel.selectors),
  trackContextMenu:    flattenPage(registry.modules.module5.pages.trackContextMenu.selectors),
} as const;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * `L` — root locator registry.
 *
 * @example
 *   import { L } from '../fixtures/locators';
 *   await page.locator(L.module1.loginPage.submitButton).click();
 *   await page.locator(L.module5.playerBar.playPauseButton).click();
 */
export const L = {
  module1: auth,
  module5: playback,
} as const;

export type LocatorRegistry = typeof L;

/**
 * Convenience re-exports for direct destructuring in test files.
 *
 * @example
 *   import { Auth, Playback } from '../fixtures/locators';
 *   await page.locator(Auth.loginPage.emailInput).fill('...');
 */
export const Auth     = L.module1;
export const Playback = L.module5;
