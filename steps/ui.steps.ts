import { createBdd } from "playwright-bdd";
import { expect } from "@playwright/test";

import { test } from "./world";

import { LoginPage } from "../src/pages/LoginPage";
import { ProductsPage } from "../src/pages/ProductsPage";
import { CartPage } from "../src/pages/CartPage";

const { Given, When, Then } = createBdd(test);

// ==================================================
// Login / Signup
// ==================================================

Given("I am on the login page", async ({ page }) => {
  await page.goto("/login");
});

When("I sign up with a unique email", async ({ page, state }) => {
  const loginPage = new LoginPage(page);

  state.email = `qa.framework.${Date.now()}@example.com`;

  await loginPage.startSignup("QA Framework User", state.email);
});

Then(
  "I should be redirected to the account information page",
  async ({ page }) => {
    await expect(page).toHaveURL(/\/signup/);
  },
);

When("I fill in and submit my account details", async ({ page, state }) => {
  const loginPage = new LoginPage(page);

  state.password = "TestPass123!";

  await loginPage.completeAccountDetails({
    password: state.password,
    day: "15",
    month: "6",
    year: "1992",
    firstName: "QA",
    lastName: "Framework",
    address: "1 Test Street",
    country: "India",
    state: "Karnataka",
    city: "Bengaluru",
    zipcode: "560001",
    mobileNumber: "9876543210",
  });
});

Then("I should see the account created confirmation", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.expectAccountCreated();
});

When("I continue after account creation", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.continueAfterAccountCreated();
});

Then("I should be logged in", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await expect(loginPage.loggedInAsText).toBeVisible();
});

When("I try to sign up again with the same email", async ({ page, state }) => {
  await page.goto("/login");

  const loginPage = new LoginPage(page);

  await loginPage.startSignup("QA Framework User", state.email!);
});

Then(
  "I should see an error that the email already exists",
  async ({ page }) => {
    const loginPage = new LoginPage(page);

    await expect(loginPage.signupErrorText).toBeVisible();
  },
);

When("I log in with that account's credentials", async ({ page, state }) => {
  const loginPage = new LoginPage(page);

  await loginPage.login(state.email!, state.password!);
});

When(
  "I log in with that email but an incorrect password",
  async ({ page, state }) => {
    const loginPage = new LoginPage(page);

    await loginPage.login(state.email!, "WrongPassword999!");
  },
);

When("I try to log in with a non-existent email", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.login(
    `no-such-user.${Date.now()}@example.com`,
    "SomePassword123!",
  );
});

Then("I should see an incorrect login error", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await expect(loginPage.loginErrorText).toBeVisible();
});

When("I log out", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.logout();
});

Then("I should be on the login page", async ({ page }) => {
  await expect(page).toHaveURL(/\/login/);
});

// ==================================================
// Products
// ==================================================

Given("I am on the products page", async ({ page }) => {
  const productsPage = new ProductsPage(page);

  await productsPage.goto();
});

Then(
  "I should see more than {int} products listed",
  async ({ page }, minCount: number) => {
    const productsPage = new ProductsPage(page);

    const names = await productsPage.getAllProductNames();

    expect(names.length).toBeGreaterThan(minCount);
  },
);

When("I search for {string}", async ({ page }, term: string) => {
  const productsPage = new ProductsPage(page);

  await productsPage.search(term);
});

Then('I should see the "Searched Products" heading', async ({ page }) => {
  await expect(
    page.getByRole("heading", {
      name: "Searched Products",
    }),
  ).toBeVisible();
});

Then("the search results should not be empty", async ({ page }) => {
  const productsPage = new ProductsPage(page);

  const names = await productsPage.getAllProductNames();

  expect(names.length).toBeGreaterThan(0);
});

When(
  "I expand the {string} category and open {string}",
  async ({ page }, category: string, subcategory: string) => {
    const productsPage = new ProductsPage(page);

    await productsPage.openSubcategory(category, subcategory);
  },
);

Then(
  "the page heading should mention {string}",
  async ({ page }, text: string) => {
    await expect(page.locator(".title.text-center")).toContainText(text);
  },
);

When(
  "I add {string} to the cart from the listing",
  async ({ page, state }, productName: string) => {
    const productsPage = new ProductsPage(page);

    state.productName = productName;

    await productsPage.addToCartByName(productName);
  },
);

Then('I should see the "Added!" confirmation', async ({ page }) => {
  const productsPage = new ProductsPage(page);

  await productsPage.expectAddedToCartModal();
});

When(
  "I open the detail page for {string}",
  async ({ page, state }, productName: string) => {
    const productsPage = new ProductsPage(page);

    state.productName = productName;

    await productsPage.openProductDetail(productName);
  },
);

Then(
  "the product detail heading should show {string}",
  async ({ page }, name: string) => {
    await expect(page).toHaveURL(/\/product_details\/\d+$/);
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
  },
);

// ==================================================
// Product quantity
// ==================================================

When(
  "I set the quantity to {int} and add it to the cart",
  async ({ page }, quantity: number) => {
    const quantityInput = page.locator("#quantity");

    // Make sure we are actually on the product detail page.
    await expect(quantityInput).toBeVisible();

    await quantityInput.fill(String(quantity));

    await page
      .getByRole("button", {
        name: /add to cart/i,
      })
      .click();
  },
);

When("I view the cart from the confirmation modal", async ({ page }) => {
  const productsPage = new ProductsPage(page);

  await productsPage.viewCartLink.click();
});

Then(
  "the cart should show a quantity of {int} for {string}",
  async ({ page }, quantity: number, productName: string) => {
    const cartPage = new CartPage(page);

    const qty = await cartPage.getQuantity(productName);

    expect(qty).toBe(String(quantity));
  },
);

// ==================================================
// Cart & Checkout
// ==================================================

Given(
  "I add {string} to the cart and go to the cart page",
  async ({ page, state }, productName: string) => {
    const productsPage = new ProductsPage(page);

    await productsPage.goto();

    state.productName = productName;

    await productsPage.addToCartByName(productName);

    await productsPage.expectAddedToCartModal();

    await productsPage.viewCartLink.click();
  },
);

Then(
  "the cart should contain {string}",
  async ({ page }, productName: string) => {
    const cartPage = new CartPage(page);

    await expect(cartPage.rowByProductName(productName)).toBeVisible();
  },
);

Then(
  "the cart total for that item should be its price times its quantity",
  async ({ page, state }) => {
    const cartPage = new CartPage(page);

    const row = cartPage.rowByProductName(state.productName!);

    const priceText = await row.locator(".cart_price p").innerText();

    const quantityText = await row.locator(".cart_quantity button").innerText();

    const totalText = await row
      .locator(".cart_total .cart_total_price")
      .innerText();

    const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));

    const quantity = parseInt(quantityText, 10);

    const total = parseFloat(totalText.replace(/[^0-9.]/g, ""));

    expect(total).toBeCloseTo(price * quantity, 2);
  },
);

When("I remove that item from the cart", async ({ page, state }) => {
  const cartPage = new CartPage(page);

  await cartPage.removeItem(state.productName!);
});

Then("the cart should be empty", async ({ page }) => {
  const cartPage = new CartPage(page);

  await expect(cartPage.cartRows).toHaveCount(0);
});

When("I try to proceed to checkout", async ({ page }) => {
  const cartPage = new CartPage(page);

  await cartPage.proceedToCheckout();
});

Then("I should be prompted to register or log in", async ({ page }) => {
  const cartPage = new CartPage(page);

  await expect(cartPage.registerLoginLink).toBeVisible();
});

// ==================================================
// Logged-in checkout
// ==================================================

Given(
  "I am logged in with a registered test account",
  async ({ page, state, request }) => {
    const uniqueEmail = `qa.framework.${Date.now()}@example.com`;

    const password = "TestPass123!";

    const res = await request.post(
      "https://automationexercise.com/api/createAccount",
      {
        form: {
          name: "QA Framework Test User",
          email: uniqueEmail,
          password,
          title: "Mr",
          birth_date: "10",
          birth_month: "5",
          birth_year: "1990",
          firstname: "QA",
          lastname: "Tester",
          company: "Test Co",
          address1: "1 Test Street",
          address2: "",
          country: "India",
          zipcode: "560001",
          state: "Karnataka",
          city: "Bengaluru",
          mobile_number: "9876543210",
        },
      },
    );

    const responseBody = await res.json();

    expect(responseBody.responseCode).toBe(201);

    state.email = uniqueEmail;

    state.password = password;

    const loginPage = new LoginPage(page);

    await loginPage.goto();

    await loginPage.login(uniqueEmail, password);

    await expect(loginPage.loggedInAsText).toBeVisible();
  },
);

When("I proceed to checkout", async ({ page }) => {
  const cartPage = new CartPage(page);

  await cartPage.proceedToCheckout();
});

Then("I should see the order review page", async ({ page }) => {
  await expect(page).toHaveURL(/\/checkout/);

  await expect(page.getByText("Review Your Order")).toBeVisible();
});

When("I place the order", async ({ page }) => {
  const cartPage = new CartPage(page);

  await cartPage.placeOrder("Please deliver in the afternoon.");
});

When("I complete payment with test card details", async ({ page }) => {
  const cartPage = new CartPage(page);

  await cartPage.fillPaymentDetails({
    nameOnCard: "QA Framework",
    cardNumber: "4111111111111111",
    cvc: "123",
    expiryMonth: "12",
    expiryYear: "2030",
  });
});

Then("I should see the order confirmation message", async ({ page }) => {
  const cartPage = new CartPage(page);

  await cartPage.expectOrderConfirmed();
});
