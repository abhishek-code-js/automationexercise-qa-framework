import { Page, Locator, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;

  readonly loginEmailInput: Locator;
  readonly loginPasswordInput: Locator;
  readonly loginButton: Locator;
  readonly loginErrorText: Locator;

  readonly signupNameInput: Locator;
  readonly signupEmailInput: Locator;
  readonly signupButton: Locator;
  readonly signupErrorText: Locator;

  readonly loggedInAsText: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.loginEmailInput = page.locator('[data-qa="login-email"]');
    this.loginPasswordInput = page.locator('[data-qa="login-password"]');
    this.loginButton = page.locator('[data-qa="login-button"]');
    this.loginErrorText = page.getByText(
      "Your email or password is incorrect!",
    );

    this.signupNameInput = page.locator('[data-qa="signup-name"]');
    this.signupEmailInput = page.locator('[data-qa="signup-email"]');
    this.signupButton = page.locator('[data-qa="signup-button"]');
    this.signupErrorText = page.getByText("Email Address already exist!");

    this.loggedInAsText = page.getByText("Logged in as", { exact: false });
    this.logoutLink = page.getByRole("link", { name: "Logout" });
  }

  async goto() {
    await this.page.goto("/login", {
      waitUntil: "domcontentloaded",
    });
  }

  async login(email: string, password: string) {
    await this.loginEmailInput.fill(email);
    await this.loginPasswordInput.fill(password);
    await this.loginButton.click();
  }

  async startSignup(name: string, email: string) {
    await this.signupNameInput.fill(name);
    await this.signupEmailInput.fill(email);
    await this.signupButton.click();
  }

  async completeAccountDetails(details: {
    password: string;
    day: string;
    month: string;
    year: string;
    firstName: string;
    lastName: string;
    address: string;
    country: string;
    state: string;
    city: string;
    zipcode: string;
    mobileNumber: string;
  }) {
    await this.page.locator("#id_gender1").check();
    await this.page.locator('[data-qa="password"]').fill(details.password);
    await this.page.locator("#days").selectOption(details.day);
    await this.page.locator("#months").selectOption(details.month);
    await this.page.locator("#years").selectOption(details.year);

    await this.page.locator('[data-qa="first_name"]').fill(details.firstName);
    await this.page.locator('[data-qa="last_name"]').fill(details.lastName);
    await this.page.locator('[data-qa="address"]').fill(details.address);
    await this.page
      .locator('[data-qa="country"]')
      .selectOption(details.country);
    await this.page.locator('[data-qa="state"]').fill(details.state);
    await this.page.locator('[data-qa="city"]').fill(details.city);
    await this.page.locator('[data-qa="zipcode"]').fill(details.zipcode);
    await this.page
      .locator('[data-qa="mobile_number"]')
      .fill(details.mobileNumber);

    await this.page.locator('[data-qa="create-account"]').click();
  }

  async expectAccountCreated() {
    await expect(
      this.page.locator('[data-qa="account-created"]'),
    ).toBeVisible();
  }

  async continueAfterAccountCreated() {
    await this.page.locator('[data-qa="continue-button"]').click();
  }

  async logout() {
    await this.logoutLink.click();
  }
}
