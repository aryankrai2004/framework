import { expect, test } from '@playwright/test';
import { LeaveApplicationPage } from '../pages/LeaveApplicationPage';
import { LoginPage } from '../pages/LoginPage';

const username = process.env.ORANGEHRM_USERNAME ?? 'Admin';
const password = process.env.ORANGEHRM_PASSWORD ?? 'admin123';
const leaveType = process.env.ORANGEHRM_LEAVE_TYPE ?? 'CAN - Personal';
const leaveDate = process.env.ORANGEHRM_LEAVE_DATE ?? '2026-30-10';

test.describe('OrangeHRM leave application', () => {
  test('submits a one-day leave request', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const leaveApplicationPage = new LeaveApplicationPage(page);
    let requestAlreadyExists = false;

    await test.step('Log in and check for an existing request', async () => {
      await loginPage.goto();
      await loginPage.login(username, password);
      requestAlreadyExists = await leaveApplicationPage.hasExistingRequest(
        leaveDate,
        leaveType,
      );
      await expect(page).not.toHaveURL(/\/auth\/login/);
    });

    if (requestAlreadyExists) {
      await test.step('Verify the existing leave request', async () => {
        await leaveApplicationPage.expectRequestListed(leaveDate, leaveType);
      });
      return;
    }

    let canApplyForLeave = false;
    await test.step('Open and verify the Apply Leave form', async () => {
      canApplyForLeave = await leaveApplicationPage.open();
    });
    test.skip(
      !canApplyForLeave,
      'The account has no leave type with an available balance.',
    );

    await test.step('Select a leave type and verify the available balance', async () => {
      await leaveApplicationPage.selectLeaveType(leaveType);
      await leaveApplicationPage.expectAtLeastOneDayAvailable();
    });

    await test.step('Enter and verify the requested leave date', async () => {
      await leaveApplicationPage.enterDateRange(leaveDate);
      await leaveApplicationPage.expectFormReady(leaveDate);
    });

    await test.step('Submit the leave request and verify confirmation', async () => {
      await leaveApplicationPage.submit(leaveDate, leaveType);
      await leaveApplicationPage.expectRequestListed(leaveDate, leaveType);
    });
  });
});
