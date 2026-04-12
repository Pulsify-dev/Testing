import { test, expect } from '@playwright/test';

test.describe('Module 3: Followers and Social Graph (Blackbox)', () => {
    test('M3-SMOKE-01: social routes render tabs and route-specific headings', async ({ page }) => {
        await page.goto('/following');

        await expect(page).toHaveURL(/\/following/);
        await expect(page.locator('.sc-social-tabs a[href="/following"]')).toBeVisible();
        await expect(page.locator('.sc-social-tabs a[href="/followers"]')).toBeVisible();
        await expect(page.locator('.sc-social-tabs a[href="/blocked"]')).toBeVisible();
        await expect(page.locator('.sc-social-page__title')).toContainText('Hear what the people you follow have posted');
        await expect(page.locator('.sc-social-filter__input')).toBeVisible();

        await page.click('.sc-social-tabs a[href="/followers"]');
        await expect(page).toHaveURL(/\/followers/);
        await expect(page.locator('.sc-social-page__title')).toContainText('People who follow you');

        await page.click('.sc-social-tabs a[href="/blocked"]');
        await expect(page).toHaveURL(/\/blocked/);
        await expect(page.locator('.sc-social-page__title')).toContainText('Blocked Users');
    });

    test('M3-SMOKE-02: following page shows either user content or a handled state', async ({ page }) => {
        await page.goto('/following');

        const hasCards = (await page.locator('.sc-user-card').count()) > 0;
        const hasEmpty = (await page.locator('.sc-social-empty').count()) > 0;
        const hasRetry = (await page.locator('.sc-social-retry').count()) > 0;
        const hasSkeleton = (await page.locator('.sc-user-card--skeleton').count()) > 0;

        expect(hasCards || hasEmpty || hasRetry || hasSkeleton).toBeTruthy();
    });
});
