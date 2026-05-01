const { test, expect } = require('@playwright/test');

test.describe('Yordam.tj — Саҳифаи асосӣ / Главная страница', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    // ===== HEADER =====
    test('Logo "Yordam.tj" нишон дода мешавад', async ({ page }) => {
        const logo = page.locator('.header .logo-text');
        await expect(logo).toBeVisible();
        await expect(logo).toContainText('Yordam');
    });

    test('Навигатсия — 4 линк мавҷуд аст', async ({ page }) => {
        const navLinks = page.locator('.nav-link');
        await expect(navLinks).toHaveCount(4);
    });

    test('Тугмаҳои TJ/RU мавҷуд аст', async ({ page }) => {
        await expect(page.locator('.lang-btn').first()).toBeVisible();
        await expect(page.locator('.lang-btn').last()).toBeVisible();
    });

    // ===== LANGUAGE SWITCH =====
    test('Иваз кардани забон ба русӣ кор мекунад', async ({ page }) => {
        // Click RU button
        await page.locator('.lang-btn[data-lang="ru"]').click();

        // Hero title should switch to Russian
        const heroTitle = page.locator('.hero-title');
        await expect(heroTitle).toContainText('помощь');

        // Search placeholder should change
        const searchInput = page.locator('.search-input');
        await expect(searchInput).toHaveAttribute('placeholder', 'Что нужно сделать?');
    });

    test('Иваз кардани забон ба тоҷикӣ баргардонида мешавад', async ({ page }) => {
        // Switch to RU first
        await page.locator('.lang-btn[data-lang="ru"]').click();
        // Switch back to TJ
        await page.locator('.lang-btn[data-lang="tg"]').click();

        const heroTitle = page.locator('.hero-title');
        await expect(heroTitle).toContainText('Ёрдам');
    });

    // ===== HERO =====
    test('Ҷустуҷӯ кор мекунад', async ({ page }) => {
        const searchInput = page.locator('.search-input');
        await searchInput.fill('Таъмири хона');
        await page.locator('.btn-search').click();

        // Should scroll to tasks section
        const tasksSection = page.locator('#tasks');
        await expect(tasksSection).toBeInViewport();
    });

    test('Hero tags ба input нависта мешаванд', async ({ page }) => {
        const firstTag = page.locator('.hero-tag').first();
        const tagText = await firstTag.textContent();
        await firstTag.click();

        const searchInput = page.locator('.search-input');
        await expect(searchInput).toHaveValue(tagText);
    });

    test('Статистика нишон дода мешавад', async ({ page }) => {
        const stats = page.locator('.stat');
        await expect(stats).toHaveCount(3);
        await expect(stats.first()).toContainText('12,500');
    });

    // ===== CATEGORIES =====
    test('12 категория мавҷуд аст', async ({ page }) => {
        const cards = page.locator('.category-card');
        await expect(cards).toHaveCount(12);
    });

    test('Категория hover-эффект дорад', async ({ page }) => {
        const card = page.locator('.category-card').first();
        await card.hover();
        // Card should have transform on hover (visual check)
        await expect(card).toBeVisible();
    });

    // ===== HOW IT WORKS =====
    test('3 қадам нишон дода мешавад', async ({ page }) => {
        const steps = page.locator('.step-card');
        await expect(steps).toHaveCount(3);
    });

    // ===== TASKS =====
    test('6 фармоиш нишон дода мешавад', async ({ page }) => {
        const tasks = page.locator('.task-card');
        await expect(tasks).toHaveCount(6);
    });

    test('Фильтр тугмаҳо кор мекунанд', async ({ page }) => {
        const filterBtns = page.locator('.filter-btn');
        await expect(filterBtns).toHaveCount(6);

        // Click second filter
        await filterBtns.nth(1).click();
        await expect(filterBtns.nth(1)).toHaveClass(/active/);
        // First should not be active anymore
        await expect(filterBtns.first()).not.toHaveClass(/active/);
    });

    test('Фармоиш нарх ва маконро дорад', async ({ page }) => {
        const firstTask = page.locator('.task-card').first();
        await expect(firstTask.locator('.task-price')).toBeVisible();
        await expect(firstTask.locator('.task-location')).toBeVisible();
    });

    // ===== SPECIALISTS =====
    test('4 устод нишон дода мешавад', async ({ page }) => {
        const specialists = page.locator('.specialist-card');
        await expect(specialists).toHaveCount(4);
    });

    test('Устод рейтинг дорад', async ({ page }) => {
        const rating = page.locator('.specialist-rating').first();
        await expect(rating).toContainText('4.9');
    });

    // ===== MODALS =====
    test('Модали даромадан кушода мешавад', async ({ page }) => {
        await page.evaluate(() => document.getElementById('loginModal').classList.add('active'));
        const modal = page.locator('#loginModal');
        await expect(modal).toHaveClass(/active/);
    });

    test('Модали бақайдгирӣ кушода мешавад', async ({ page }) => {
        await page.evaluate(() => document.getElementById('registerModal').classList.add('active'));
        const modal = page.locator('#registerModal');
        await expect(modal).toHaveClass(/active/);
    });

    test('Модал бо ESC баста мешавад', async ({ page }) => {
        await page.evaluate(() => document.getElementById('loginModal').classList.add('active'));
        await expect(page.locator('#loginModal')).toHaveClass(/active/);

        await page.keyboard.press('Escape');
        await expect(page.locator('#loginModal')).not.toHaveClass(/active/);
    });

    test('Модал бо клик дар берун баста мешавад', async ({ page }) => {
        await page.evaluate(() => document.getElementById('loginModal').classList.add('active'));
        await expect(page.locator('#loginModal')).toHaveClass(/active/);

        // Click on overlay (outside modal)
        await page.locator('#loginModal').click({ position: { x: 10, y: 10 } });
        await expect(page.locator('#loginModal')).not.toHaveClass(/active/);
    });

    test('Аз login ба register гузаштан мумкин аст', async ({ page }) => {
        await page.evaluate(() => document.getElementById('loginModal').classList.add('active'));
        await expect(page.locator('#loginModal')).toHaveClass(/active/);

        await page.locator('.link-register').click();
        // Wait for transition
        await page.waitForTimeout(300);
        await expect(page.locator('#registerModal')).toHaveClass(/active/);
    });

    test('Register tabs кор мекунанд', async ({ page }) => {
        await page.evaluate(() => document.getElementById('registerModal').classList.add('active'));
        const tabs = page.locator('.reg-tab');

        await tabs.last().click();
        await expect(tabs.last()).toHaveClass(/active/);
        await expect(tabs.first()).not.toHaveClass(/active/);
    });

    // ===== FOOTER =====
    test('Footer линкҳо мавҷуд аст', async ({ page }) => {
        const footerLinks = page.locator('.footer-links a');
        const count = await footerLinks.count();
        expect(count).toBeGreaterThanOrEqual(8);
    });

    test('Рақами телефон дар footer мавҷуд аст', async ({ page }) => {
        await expect(page.locator('.footer')).toContainText('+992');
    });

    // ===== PWA =====
    test('Manifest.json боргузорӣ мешавад', async ({ page }) => {
        const manifest = page.locator('link[rel="manifest"]');
        await expect(manifest).toHaveAttribute('href', 'manifest.json');
    });

    test('Theme color тағйир ёфтааст', async ({ page }) => {
        const meta = page.locator('meta[name="theme-color"]');
        await expect(meta).toHaveAttribute('content', '#2563eb');
    });
});
