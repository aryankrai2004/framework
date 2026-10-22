import { expect, Locator, Page } from '@playwright/test';

export class PersonalDetailsPage {
  readonly pageTitle: Locator;
  readonly firstNameInput: Locator;
  readonly middleNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly employeeIdInput: Locator;
  readonly nationalityDropdown: Locator;
  readonly maritalStatusDropdown: Locator;
  readonly saveButton: Locator;
  readonly successToast: Locator;

  constructor(private readonly page: Page) {
    this.pageTitle = page.getByRole('heading', { name: 'Personal Details' });
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.middleNameInput = page.getByRole('textbox', { name: 'Middle Name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    this.employeeIdInput = page
      .locator('.oxd-input-group')
      .filter({ hasText: 'Employee Id' })
      .getByRole('textbox');
    this.nationalityDropdown = page
      .locator('.oxd-input-group')
      .filter({ hasText: 'Nationality' })
      .locator('.oxd-select-text');
    this.maritalStatusDropdown = page
      .locator('.oxd-input-group')
      .filter({ hasText: 'Marital Status' })
      .locator('.oxd-select-text');
    const personalDetailsForm = page
      .locator('form')
      .filter({ has: this.firstNameInput });
    this.saveButton = personalDetailsForm.getByRole('button', {
      name: 'Save',
      exact: true,
    });
    this.successToast = page
      .locator('.oxd-toast')
      .filter({ hasText: 'Successfully Updated' });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/pim\/viewPersonalDetails/);
    await expect(this.pageTitle).toBeVisible();
  }

  async updatePersonalDetails(details: {
    firstName: string;
    middleName: string;
    lastName: string;
    employeeId: string;
    nationality: string;
    maritalStatus: string;
    gender: 'Male' | 'Female';
  }): Promise<void> {
    await this.firstNameInput.fill(details.firstName);
    await this.middleNameInput.fill(details.middleName);
    await this.lastNameInput.fill(details.lastName);
    await this.employeeIdInput.fill(details.employeeId);

    await this.nationalityDropdown.click();
    await this.page
      .getByRole('option', { name: details.nationality, exact: true })
      .click();

    await this.maritalStatusDropdown.click();
    await this.page
      .getByRole('option', { name: details.maritalStatus, exact: true })
      .click();

    await this.page.getByText(details.gender, { exact: true }).click();
    await this.saveButton.click();
  }

  async expectUpdateSuccess(): Promise<void> {
    await expect(this.successToast).toBeVisible();
    await expect(this.successToast).toContainText('Successfully Updated');
  }
}
