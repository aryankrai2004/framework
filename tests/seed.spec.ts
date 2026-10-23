import { test } from '@playwright/test';
import { OrangeHrmWorkflow } from '../workflows/OrangeHrmWorkflow';

const username = process.env.ORANGEHRM_USERNAME ?? 'Admin';
const password = process.env.ORANGEHRM_PASSWORD ?? 'admin123';

test('seed - signed-in employee on My Info', async ({ page }) => {
  const orangeHrm = new OrangeHrmWorkflow(page, username, password);

  await orangeHrm.signInAndOpenPersonalDetails();
});
