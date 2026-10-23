import { test } from '@playwright/test';
import { OrangeHrmWorkflow } from '../workflows/OrangeHrmWorkflow';

const username = process.env.ORANGEHRM_USERNAME ?? 'Admin';
const password = process.env.ORANGEHRM_PASSWORD ?? 'admin123';

test.describe('OrangeHRM sign-in', () => {
  test('an employee can sign in and open My Info', async ({ page }) => {
    const orangeHrm = new OrangeHrmWorkflow(page, username, password);

    await orangeHrm.signInAndOpenPersonalDetails();
  });

  test('invalid sign-in details are rejected', async ({ page }) => {
    const orangeHrm = new OrangeHrmWorkflow(page, username, password);

    await orangeHrm.signInWithInvalidCredentials(
      'invalid-user',
      'invalid-password',
    );
  });
});
