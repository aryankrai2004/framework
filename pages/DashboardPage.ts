import { expect, Locator, Page } from '@playwright/test';

export class DashboardPage {
  readonly pageTitle: Locator;
  readonly myInfoLink: Locator;

  constructor(private readonly page: Page) {
    this.pageTitle = page.getByRole('banner').getByRole('heading');
    this.myInfoLink = page.locator(
      'a[href="/web/index.php/pim/viewMyDetails"]',
    );
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/dashboard\/index/);
    await expect(this.pageTitle).toBeVisible();
    await expect(this.myInfoLink).toBeVisible();
  }

  async openPersonalDetails(): Promise<void> {
    await this.myInfoLink.click();
    await expect(this.page).toHaveURL(/\/pim\/viewPersonalDetails/);
  }
}
