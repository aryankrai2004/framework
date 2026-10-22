import { test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { PersonalDetailsPage } from '../pages/PersonalDetailsPage';

const username = process.env.ORANGEHRM_USERNAME ?? 'Admin';
const password = process.env.ORANGEHRM_PASSWORD ?? 'admin123';

const updatedDetails = {
  firstName: 'Rajat',
  middleName: '',
  lastName: 'Gupta',
  employeeId: 'mho64',
  nationality: 'Indian',
  maritalStatus: 'Single',
  gender: 'Male' as const,
};

test.describe('OrangeHRM Personal Details', () => {
  test('updates personal details and confirms the save', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const personalDetailsPage = new PersonalDetailsPage(page);

    await test.step('Log in and open My Info', async () => {
      await loginPage.goto();
      await loginPage.login(username, password);
      await dashboardPage.expectLoaded();
      await dashboardPage.openPersonalDetails();
      await personalDetailsPage.expectLoaded();
    });

    await test.step('Update and save Personal Details', async () => {
      await personalDetailsPage.updatePersonalDetails(updatedDetails);
    });

    await test.step('Assert the successful update confirmation', async () => {
      await personalDetailsPage.expectUpdateSuccess();
    });
  });
});
