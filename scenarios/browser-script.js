import { browser } from 'k6/browser';
import { check, fail } from 'k6';

const BASE_URL =
  __ENV.BASE_URL || 'https://quickpizza.grafana.com';

const BROWSER_TAGS = {
  test_type: 'browser',
  feature: 'quickpizza-ui',
};

export default async function UIQuickPizza() {
  const page = await browser.newPage();

  try {
    await page.goto(BASE_URL);

    const title = await page.locator('h1').textContent();

    const titleCheck = check(
      title,
      {
        'pizza page loaded correctly': (value) =>
          value ===
          'Looking to break out of your pizza routine?',
      },
      BROWSER_TAGS
    );

    if (!titleCheck) {
      fail('Pizza page title is invalid');
    }

    await page
      .locator('//button[. = "Pizza, Please!"]')
      .click();

    await page.waitForTimeout(500);

    const recommendations = await page
      .locator('#recommendations')
      .textContent();

    check(
      recommendations,
      {
        'recommendations are displayed': (value) =>
          Boolean(value && value.trim().length > 0),
      },
      BROWSER_TAGS
    );

    await page.screenshot({
      path: 'screenshot.png',
    });
  } catch (error) {
    fail(`Browser iteration failed: ${error.message}`);
  } finally {
    await page.close();
  }
}
