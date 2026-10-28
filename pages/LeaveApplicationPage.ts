import { expect, Locator, Page } from '@playwright/test';

export class LeaveApplicationPage {
  readonly leaveForm: Locator;
  readonly pageTitle: Locator;
  readonly noLeaveTypesMessage: Locator;
  readonly formLoader: Locator;
  readonly leaveTypeDropdown: Locator;
  readonly leaveBalance: Locator;
  readonly dateInputs: Locator;
  readonly commentsInput: Locator;
  readonly applyButton: Locator;
  readonly successToast: Locator;
  readonly overlappingRequestsHeading: Locator;

  constructor(private readonly page: Page) {
    this.pageTitle = page
      .getByRole('heading')
      .filter({ hasText: /apply leave|solicitar licencia/i });
    this.leaveForm = page.locator('.oxd-form');
    this.noLeaveTypesMessage = page.getByText(
      /no leave types with leave balance|no hay tipos de.*saldo/i,
    );
    this.formLoader = page.locator('.oxd-form-loader');
    this.leaveTypeDropdown = this.leaveForm.locator('.oxd-select-text').first();
    this.leaveBalance = page.getByText(/\d+(?:\.\d+)? Day\(s\)/);
    this.dateInputs = this.leaveForm.getByRole('textbox', {
      name: 'yyyy-dd-mm',
    });
    this.commentsInput = this.leaveForm
      .locator('.oxd-input-group')
      .last()
      .getByRole('textbox');
    this.applyButton = this.leaveForm.getByRole('button').last();
    this.successToast = page.locator('.oxd-toast--success');
    this.overlappingRequestsHeading = page
      .getByRole('heading')
      .filter({
        hasText: /overlapping leave request|solicitudes de licencia.*superpuestas/i,
      });
  }

  async open(): Promise<boolean> {
    await this.page.goto('/web/index.php/leave/applyLeave');
    await expect(this.page).toHaveURL(/\/leave\/applyLeave/);
    await expect(this.pageTitle).toBeVisible();
    await this.waitForFormLoader();

    if (await this.noLeaveTypesMessage.isVisible()) {
      return false;
    }

    await expect(this.leaveTypeDropdown).toBeVisible();
    await expect(this.dateInputs).toHaveCount(2);
    await expect(this.commentsInput).toBeVisible();
    await expect(this.applyButton).toBeVisible();
    return true;
  }

  async selectLeaveType(name: string): Promise<void> {
    await this.waitForFormLoader();
    await this.leaveTypeDropdown.click();
    await this.page.getByRole('option', { name, exact: true }).click();
    await this.waitForFormLoader();
    await expect(this.leaveTypeDropdown).toContainText(name);
    await expect(this.leaveBalance).toBeVisible();
  }

  async enterDateRange(date: string): Promise<void> {
    await expect(this.dateInputs).toHaveCount(2);

    for (const input of await this.dateInputs.all()) {
      await input.fill('');
      await input.fill(date);
      await expect(input).toHaveValue(date);
    }
  }

  async expectFormReady(date: string): Promise<void> {
    await expect(this.leaveForm).toBeVisible();
    await expect(this.leaveTypeDropdown).not.toContainText('-- Select --');
    await expect(this.dateInputs).toHaveCount(2);
    for (const input of await this.dateInputs.all()) {
      await expect(input).toHaveValue(date);
    }
    await expect(this.applyButton).toBeEnabled();
  }

  async hasAtLeastOneDayAvailable(): Promise<boolean> {
    const balanceText = await this.leaveBalance.textContent();
    const availableDays = Number.parseFloat(balanceText ?? '');

    expect(
      Number.isFinite(availableDays),
      `Could not read the available leave balance from "${balanceText}"`,
    ).toBe(true);

    return availableDays >= 1;
  }

  private async waitForFormLoader(): Promise<void> {
    await expect(this.formLoader).toBeHidden();
  }

  private requestRow(date: string, leaveType: string): Locator {
    return this.page
      .getByRole('row')
      .filter({ hasText: date })
      .filter({ hasText: leaveType });
  }

  async hasExistingRequest(date: string, leaveType: string): Promise<boolean> {
    await this.page.goto('/web/index.php/leave/viewMyLeaveList');
    await expect(this.page).toHaveURL(/\/leave\/viewMyLeaveList/);

    const matchingRequest = this.requestRow(date, leaveType);
    if ((await matchingRequest.count()) === 0) {
      return false;
    }

    await expect(matchingRequest).toContainText(
      /pending approval|pendiente de aprobación/i,
    );
    return true;
  }

  async expectRequestListed(date: string, leaveType: string): Promise<void> {
    await this.page.goto('/web/index.php/leave/viewMyLeaveList');
    await expect(this.page).toHaveURL(/\/leave\/viewMyLeaveList/);

    const matchingRequest = this.requestRow(date, leaveType);
    await expect(matchingRequest).toHaveCount(1);
    await expect(matchingRequest).toContainText(
      /pending approval|pendiente de aprobación/i,
    );
  }

  async submit(date: string, leaveType: string): Promise<void> {
    await this.applyButton.click();

    await expect(
      this.successToast.or(this.overlappingRequestsHeading),
    ).toBeVisible();

    if (await this.successToast.isVisible()) {
      await expect(this.successToast).toContainText('Successfully Saved');
      return;
    }

    await expect(this.overlappingRequestsHeading).toBeVisible();
    const matchingRequest = this.page
      .getByRole('row')
      .filter({ hasText: date })
      .filter({ hasText: leaveType });
    await expect(matchingRequest).toHaveCount(1);
    await expect(matchingRequest).toContainText('Pending Approval');
  }
}
