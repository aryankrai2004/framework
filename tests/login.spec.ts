import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { PersonalDetailsPage } from '../pages/PersonalDetailsPage';

const username = process.env.ORANGEHRM_USERNAME ?? 'Admin';
const password = process.env.ORANGEHRM_PASSWORD ?? 'admin123';

async function runStep(
  title: string,
  action: () => Promise<void>,
): Promise<void> {
  await test.step(title, async () => {
    console.log(`[STEP] ${title} - started`);
    await action();
    console.log(`[STEP] ${title} - completed`);
  });
}

test.describe('OrangeHRM login', () => {
  test('logs in with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const personalDetailsPage = new PersonalDetailsPage(page);

    await runStep('Open the OrangeHRM login page', async () => {
      await loginPage.goto();
      await expect(page).toHaveURL(/\/auth\/login/);
      await expect(loginPage.usernameInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.submitButton).toBeVisible();
    });

    await runStep('Enter the username', () =>
      loginPage.usernameInput.fill(username),
    );

    await runStep('Enter the password', () =>
      loginPage.passwordInput.fill(password),
    );

    await runStep('Submit the login form', () =>
      loginPage.submitButton.click(),
    );

    await runStep('Verify the dashboard is displayed', () =>
      dashboardPage.expectLoaded(),
    );

    await runStep('Open the authenticated My Info page', () =>
      dashboardPage.openPersonalDetails(),
    );

    await runStep('Verify the Personal Details page is displayed', () =>
      personalDetailsPage.expectLoaded(),
    );
  });

  test('shows an error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await runStep('Open the OrangeHRM login page', async () => {
      await loginPage.goto();
      await expect(page).toHaveURL(/\/auth\/login/);
      await expect(loginPage.usernameInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.submitButton).toBeVisible();
    });

    await runStep('Enter an invalid username', () =>
      loginPage.usernameInput.fill('invalid-user'),
    );

    await runStep('Enter an invalid password', () =>
      loginPage.passwordInput.fill('invalid-password'),
    );

    await runStep('Submit the login form', () =>
      loginPage.submitButton.click(),
    );

    await runStep('Verify the invalid-credentials error is displayed', async () => {
      await expect(loginPage.errorMessage).toHaveText('Invalid credentials');
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });
});
