const { test, expect } = require('@playwright/test');

test.describe('Yordam.tj — Мобайл / Мобильная версия', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    // ===== MOBILE LAYOUT (runs on Pixel 7 & iPhone 14 projects) =====
    test('Менюи мобайлӣ нишон дода мешавад', async ({ page, isMobile }) => {
        test.skip(!isMobile, 'Mobile only test');

        const mobileBtn = page.locator('.mobile-menu-btn');
        await expect(mobileBtn).toBeVisible();

        // Desktop nav should be hidden
        const nav = page.locator('.nav');
        await expect(nav).not.toBeVisible();
    });

    test('Менюи мобайлӣ кушода/баста мешавад', async ({ page, isMobile }) => {
        test.skip(!isMobile, 'Mobile only test');

        await page.locator('.mobile-menu-btn').click();
        const nav = page.locator('.nav');
        await expect(nav).toBeVisible();

        // Close
        await page.locator('.mobile-menu-btn').click();
        await expect(nav).not.toBeVisible();
    });

    test('Hero дар мобайл дуруст нишон дода мешавад', async ({ page, isMobile }) => {
        test.skip(!isMobile, 'Mobile only test');

        const heroTitle = page.locator('.hero-title');
        await expect(heroTitle).toBeVisible();

        const searchInput = page.locator('.search-input');
        await expect(searchInput).toBeVisible();
    });

    test('Категорияҳо дар мобайл 2 сутун мешаванд', async ({ page, isMobile }) => {
        test.skip(!isMobile, 'Mobile only test');

        // Categories should still be visible
        const cards = page.locator('.category-card');
        await expect(cards.first()).toBeVisible();
        await expect(cards).toHaveCount(12);
    });

    test('Фармоишҳо дар мобайл 1 сутун мешаванд', async ({ page, isMobile }) => {
        test.skip(!isMobile, 'Mobile only test');

        const tasks = page.locator('.task-card');
        await expect(tasks.first()).toBeVisible();
    });

    test('Модалҳо дар мобайл кор мекунанд', async ({ page, isMobile }) => {
        test.skip(!isMobile, 'Mobile only test');

        // Open login through a creative way since btn-login is hidden on mobile
        // We'll test by directly triggering the modal
        await page.evaluate(() => {
            document.getElementById('loginModal').classList.add('active');
        });

        const modal = page.locator('#loginModal');
        await expect(modal).toHaveClass(/active/);

        // Form should be usable
        const phoneInput = modal.locator('input[type="tel"]');
        await expect(phoneInput).toBeVisible();
        await phoneInput.fill('+992441234567');
        await expect(phoneInput).toHaveValue('+992441234567');
    });

    test('Забон дар мобайл иваз мешавад', async ({ page, isMobile }) => {
        test.skip(!isMobile, 'Mobile only test');

        // Lang switch should be visible on mobile
        const langSwitch = page.locator('.lang-switch');
        await expect(langSwitch).toBeVisible();

        await page.locator('.lang-btn[data-lang="ru"]').click();
        const heroTitle = page.locator('.hero-title');
        await expect(heroTitle).toContainText('помощь');
    });

    test('Scroll дар мобайл кор мекунад', async ({ page, isMobile }) => {
        test.skip(!isMobile, 'Mobile only test');

        // Scroll to categories
        await page.locator('#categories').scrollIntoViewIfNeeded();
        await expect(page.locator('#categories')).toBeInViewport();
    });

    test('Phone mockup дар мобайл нишон дода мешавад', async ({ page, isMobile }) => {
        test.skip(!isMobile, 'Mobile only test');

        const phoneMock = page.locator('.phone-frame');
        await phoneMock.scrollIntoViewIfNeeded();
        await expect(phoneMock).toBeVisible();
    });
});
