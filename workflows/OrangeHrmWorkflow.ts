import { Page, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LeaveApplicationPage } from '../pages/LeaveApplicationPage';
import { LoginPage } from '../pages/LoginPage';
import {
  PersonalDetails,
  PersonalDetailsPage,
} from '../pages/PersonalDetailsPage';

export type LeaveApplicationResult =
  | 'submitted'
  | 'already-submitted'
  | 'no-entitlement';

export class OrangeHrmWorkflow {
  private readonly loginPage: LoginPage;
  private readonly dashboardPage: DashboardPage;
  private readonly personalDetailsPage: PersonalDetailsPage;
  private readonly leaveApplicationPage: LeaveApplicationPage;

  constructor(
    page: Page,
    private readonly username: string,
    private readonly password: string,
  ) {
    this.loginPage = new LoginPage(page);
    this.dashboardPage = new DashboardPage(page);
    this.personalDetailsPage = new PersonalDetailsPage(page);
    this.leaveApplicationPage = new LeaveApplicationPage(page);
  }

  async signInAndOpenPersonalDetails(): Promise<void> {
    await test.step('Sign in to OrangeHRM', async () => {
      await this.loginPage.open();
      await this.loginPage.login(this.username, this.password);
      await this.dashboardPage.expectLoaded();
    });

    await test.step('Open My Info', async () => {
      await this.dashboardPage.openPersonalDetails();
      await this.personalDetailsPage.expectLoaded();
    });
  }

  async signInWithInvalidCredentials(
    invalidUsername: string,
    invalidPassword: string,
  ): Promise<void> {
    await test.step('Enter invalid sign-in details', async () => {
      await this.loginPage.open();
      await this.loginPage.login(invalidUsername, invalidPassword);
    });

    await test.step('Verify OrangeHRM rejects the sign-in', async () => {
      await this.loginPage.expectInvalidCredentials();
    });
  }

  async updatePersonalDetails(details: PersonalDetails): Promise<void> {
    await this.signInAndOpenPersonalDetails();

    await test.step('Update and save the employee details', async () => {
      await this.personalDetailsPage.updatePersonalDetails(details);
      await this.personalDetailsPage.expectUpdateSuccess();
    });
  }

  async applyForOneDayLeave(
    leaveType: string,
    leaveDate: string,
  ): Promise<LeaveApplicationResult> {
    await test.step('Sign in to OrangeHRM', async () => {
      await this.loginPage.open();
      await this.loginPage.login(this.username, this.password);
      await this.dashboardPage.expectLoaded();
    });

    const requestAlreadyExists = await test.step(
      'Check My Leave for an existing request',
      () => this.leaveApplicationPage.hasExistingRequest(leaveDate, leaveType),
    );

    if (requestAlreadyExists) {
      await test.step('Verify the existing request is awaiting approval', () =>
        this.leaveApplicationPage.expectRequestListed(leaveDate, leaveType),
      );
      return 'already-submitted';
    }

    const canApply = await test.step('Open the Apply Leave form', () =>
      this.leaveApplicationPage.open(),
    );

    if (!canApply) {
      return 'no-entitlement';
    }

    const hasEnoughLeaveBalance = await test.step(
      'Choose the leave type and check the available balance',
      async () => {
        await this.leaveApplicationPage.selectLeaveType(leaveType);
        return this.leaveApplicationPage.hasAtLeastOneDayAvailable();
      },
    );

    if (!hasEnoughLeaveBalance) {
      return 'no-entitlement';
    }

    await test.step('Enter and verify the requested day', async () => {
      await this.leaveApplicationPage.enterDateRange(leaveDate);
      await this.leaveApplicationPage.expectFormReady(leaveDate);
    });

    await test.step('Submit the request and verify it is awaiting approval', async () => {
      await this.leaveApplicationPage.submit(leaveDate, leaveType);
      await this.leaveApplicationPage.expectRequestListed(leaveDate, leaveType);
    });

    return 'submitted';
  }
}
