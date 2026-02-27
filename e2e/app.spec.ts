import { test, expect } from '@playwright/test';

test.describe('App flows', () => {
  test('should load main menu', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Oubliette/i })).toBeVisible({ timeout: 10000 });
  });

  test('should start a run and reach pre-draw', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Start Run' }).click();
    await expect(page.getByText(/Ready to Play|Run Round/i)).toBeVisible({ timeout: 5000 });
  });

  test('should run a round and reach game table', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Start Run' }).click();
    await page.getByRole('button', { name: /Run Round/i }).click();
    await expect(page.getByText(/Your Hand|Hold the cards/i)).toBeVisible({ timeout: 10000 });
  });

  test('should open and close tutorial', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'How to Play' }).click();
    await expect(page.getByText(/How to Play|Tutorial/i)).toBeVisible({ timeout: 5000 });
    await page.keyboard.press('Escape');
    await expect(page.getByText(/How to Play|Tutorial/i)).not.toBeVisible();
  });
});
