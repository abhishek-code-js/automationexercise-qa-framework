// tests/ui/login.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "../../src/pages/LoginPage";

test.describe("Login and Signup (plain spec)", () => {
  test("a new user can sign up with a unique email and the account is created", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    const email = `plain.spec.${Date.now()}@example.com`;

    await loginPage.goto();
    await loginPage.startSignup("Plain Spec User", email);
    await expect(page).toHaveURL(/\/signup/);

    await loginPage.completeAccountDetails({
      password: "TestPass123!",
      day: "12",
      month: "8",
      year: "1991",
      firstName: "Plain",
      lastName: "Spec",
      address: "1 Test Street",
      country: "India",
      state: "Karnataka",
      city: "Bengaluru",
      zipcode: "560001",
      mobileNumber: "9876543210",
    });

    await loginPage.expectAccountCreated();
    await loginPage.continueAfterAccountCreated();
    await expect(loginPage.loggedInAsText).toBeVisible();
  });

  test("a registered user can log in successfully", async ({
    page,
    request,
  }) => {
    // Seeded via API rather than the UI — same pattern as
    // steps/account-setup.steps.ts, inlined here since a plain spec has
    // no Background/Given step to reuse it from.
    const email = `plain.spec.${Date.now()}@example.com`;
    const password = "TestPass123!";
    const createRes = await request.post(
      "https://automationexercise.com/api/createAccount",
      {
        form: {
          name: "Plain Spec User",
          email,
          password,
          title: "Mr",
          birth_date: "1",
          birth_month: "1",
          birth_year: "1990",
          firstname: "Plain",
          lastname: "Spec",
          company: "",
          address1: "1 Test St",
          address2: "",
          country: "India",
          zipcode: "560001",
          state: "Karnataka",
          city: "Bengaluru",
          mobile_number: "9876543210",
        },
      },
    );
    expect((await createRes.json()).responseCode).toBe(201);

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, password);
    await expect(loginPage.loggedInAsText).toBeVisible();
  });

  test("login fails with an incorrect password", async ({ page, request }) => {
    const email = `plain.spec.${Date.now()}@example.com`;
    const password = "TestPass123!";
    await request.post("https://automationexercise.com/api/createAccount", {
      form: {
        name: "Plain Spec User",
        email,
        password,
        title: "Mr",
        birth_date: "1",
        birth_month: "1",
        birth_year: "1990",
        firstname: "Plain",
        lastname: "Spec",
        company: "",
        address1: "1 Test St",
        address2: "",
        country: "India",
        zipcode: "560001",
        state: "Karnataka",
        city: "Bengaluru",
        mobile_number: "9876543210",
      },
    });

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, "WrongPassword999!");
    await expect(loginPage.loginErrorText).toBeVisible();
  });

  test("a logged-in user can log out", async ({ page, request }) => {
    const email = `plain.spec.${Date.now()}@example.com`;
    const password = "TestPass123!";
    await request.post("https://automationexercise.com/api/createAccount", {
      form: {
        name: "Plain Spec User",
        email,
        password,
        title: "Mr",
        birth_date: "1",
        birth_month: "1",
        birth_year: "1990",
        firstname: "Plain",
        lastname: "Spec",
        company: "",
        address1: "1 Test St",
        address2: "",
        country: "India",
        zipcode: "560001",
        state: "Karnataka",
        city: "Bengaluru",
        mobile_number: "9876543210",
      },
    });

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, password);
    await expect(loginPage.loggedInAsText).toBeVisible();

    await loginPage.logout();
    await expect(page).toHaveURL(/\/login/);
  });
});
