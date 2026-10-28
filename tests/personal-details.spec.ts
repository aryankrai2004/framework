import { test } from '@playwright/test';
import { PersonalDetails } from '../pages/PersonalDetailsPage';
import { OrangeHrmWorkflow } from '../workflows/OrangeHrmWorkflow';

const username = process.env.ORANGEHRM_USERNAME ?? 'Admin';
const password = process.env.ORANGEHRM_PASSWORD ?? 'admin123';

const employeeDetails: PersonalDetails = {
  firstName: 'Rajat',
  middleName: '',
  lastName: 'Gupta',
  employeeId: 'mho64',
  nationality: 'Indian',
  maritalStatus: 'Single',
  gender: 'Male',
};

test('an employee can update personal details', async ({ page }) => {
  test.setTimeout(60_000);
  const orangeHrm = new OrangeHrmWorkflow(page, username, password);

  await orangeHrm.updatePersonalDetails(employeeDetails);
});
