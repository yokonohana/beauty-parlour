import { test, expect } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Функциональные требования', () => {
  test('Проверка входа и регистрации', async ({ page }) => {
    await page.goto(`${baseUrl}/auth`);
    await expect(page.locator('h2')).toHaveText(/Вход в приложение/i);

    await page.click('button:has-text("Войти")');
    await expect(page.locator('.error')).toHaveCountGreaterThan(0);

    await page.click('button:has-text("Регистрация")');
    await expect(page).toHaveURL(/registration/);

    await page.fill('input#email', 'invalid-email');
    await page.click('button:has-text("Зарегистрироваться")');
    await expect(page.locator('.error')).toHaveText(/Неверный формат email/i);
  });

  test('Просмотр и создание записи на услугу', async ({ page }) => {
    await page.goto(`${baseUrl}/appointments`);
    await expect(page.locator('.appointment-item')).toHaveCountGreaterThan(0);

    await page.click('button:has-text("Записаться")');
    await expect(page.locator('.appointment-form')).toBeVisible();
  });

  test('Просмотр акций и отзывов', async ({ page }) => {
    await page.goto(`${baseUrl}/promotions`);
    await expect(page.locator('.promotion-item')).toHaveCountGreaterThan(0);

    await page.goto(`${baseUrl}/reviews`);
    await expect(page.locator('.review-item')).toHaveCountGreaterThan(0);
  });
});

test.describe('Интерфейсы взаимодействия', () => {
  test('Проверка корректного отображения и перехода по навигации', async ({ page }) => {
    await page.goto(baseUrl);

    const linkMap = {
      'Услуги и цены': 'services',
      'Акции': 'promotions',
      'Отзывы': 'reviews',
      'Галерея': 'gallery',
      'Контакты': 'contacts',
    };

    for (const linkText of links) {
      await page.click(`a.nav-link:has-text("${linkText}")`);
      await expect(page).toHaveURL(new RegExp(linkMap[linkText], 'i'));
      await page.goBack();
    }
  });

  test('Проверка работы кнопок Вход и Регистрация', async ({ page }) => {
    await page.goto(baseUrl);

    await page.click('a.login-button');
    await expect(page).toHaveURL(/auth/);

    await page.goto(baseUrl);
    await page.click('a.register-button');
    await expect(page).toHaveURL(/registration/);
  });
});

test.describe('Нефункциональные требования', () => {
  test('Проверка производительности загрузки главной страницы', async ({ page }) => {
    const response = await page.goto(baseUrl);
    expect(response.status()).toBeLessThan(400);

    const timing = await page.evaluate(() =>
      performance.timing.loadEventEnd - performance.timing.navigationStart
    );
    console.log('Время загрузки (мс):', timing);
    expect(timing).toBeLessThan(3000);
  });

  test('Проверка адаптивности (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(baseUrl);
    await expect(page.locator('header')).toBeVisible();
  });

  test('Проверка устойчивости форм к неправильному вводу', async ({ page }) => {
    await page.goto(`${baseUrl}/auth`);
    await page.fill('input#email', 'wrongemail@');
    await page.fill('input#password', '');
    await page.click('button:has-text("Войти")');
    await expect(page.locator('.error')).toHaveCountGreaterThan(0);
  });
});

test.describe('Предполагаемые сценарии использования', () => {
  test('Пользователь регистрируется, входит, делает запись, и выходит', async ({ page }) => {
    await page.goto(`${baseUrl}/registration`);
    await page.fill('input#email', 'testuser@example.com');
    await page.fill('input#password', '12345678');
    await page.click('button:has-text("Зарегистрироваться")');
    await expect(page.locator('.success-message')).toBeVisible();

    await page.goto(`${baseUrl}/auth`);
    await page.fill('input#email', 'testuser@example.com');
    await page.fill('input#password', '12345678');
    await page.click('button:has-text("Войти")');
    await expect(page).toHaveURL(/account/);

    await page.goto(`${baseUrl}/appointments`);
    await page.click('button:has-text("Записаться")');
    await expect(page.locator('.appointment-form')).toBeVisible();

    await page.click('button:has-text("Выйти")');
    await expect(page).toHaveURL(baseUrl);
  });

  test('Пользователь просматривает галерею и оставляет отзыв', async ({ page }) => {
    await page.goto(`${baseUrl}/gallery`);
    await page.click('.gallery-photo:first-child');
    await expect(page.locator('.modal')).toBeVisible();
    await page.click('.modal-close');
    await expect(page.locator('.modal')).toBeHidden();

    await page.goto(`${baseUrl}/reviews`);
    await page.fill('textarea[name="review"]', 'Отличный сервис!');
    await page.fill('input[name="name"]', 'Тестовый пользователь');
    await page.click('button:has-text("Отправить")');
    await expect(page.locator('.success-message')).toHaveText(/Спасибо за ваш отзыв/i);
  });
});

test.describe('Технические характеристики', () => {
  test('Проверка HTTP-статусов основных API эндпоинтов', async ({ request }) => {
    const endpoints = [
      '/home',
      '/appointments',
      '/reviews',
      '/gallery',
      '/promotions',
      '/auth',
      '/registration',
      '/account',
    ];

    for (const endpoint of endpoints) {
      const response = await request.get(`${baseUrl}${endpoint}`);
      expect(response.status()).toBeLessThan(400);
    }
  });

  test('Проверка безопасности HTTP-заголовков', async ({ page }) => {
    const response = await page.goto(baseUrl);
    const headers = response.headers();

    expect(headers['x-frame-options']).toBeDefined();
    expect(headers['content-security-policy']).toBeDefined();
  });
});
