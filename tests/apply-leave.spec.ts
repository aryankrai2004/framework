import { test } from '@playwright/test';
import { OrangeHrmWorkflow } from '../workflows/OrangeHrmWorkflow';

const username = process.env.ORANGEHRM_USERNAME ?? 'Admin';
const password = process.env.ORANGEHRM_PASSWORD ?? 'admin123';
const leaveType = process.env.ORANGEHRM_LEAVE_TYPE ?? 'CAN - Personal';
const leaveDate = process.env.ORANGEHRM_LEAVE_DATE ?? '2026-30-10';

test('an employee can apply for one day of leave', async ({ page }) => {
  const orangeHrm = new OrangeHrmWorkflow(page, username, password);
  const result = await orangeHrm.applyForOneDayLeave(leaveType, leaveDate);

  test.skip(
    result === 'no-entitlement',
    'The account has no leave type with an available balance.',
  );
});
