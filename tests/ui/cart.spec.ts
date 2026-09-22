// tests/ui/cart.spec.ts
import { test, expect } from "@playwright/test";
import { ProductsPage } from "../../src/pages/ProductsPage";
import { CartPage } from "../../src/pages/CartPage";
import { LoginPage } from "../../src/pages/LoginPage";

async function addProductAndGoToCart(
  page: import("@playwright/test").Page,
  productName: string,
) {
  const productsPage = new ProductsPage(page);
  await productsPage.goto();
  await productsPage.addToCartByName(productName);
  await productsPage.expectAddedToCartModal();
  await productsPage.viewCartLink.click();
}

test.describe("Cart and Checkout (plain spec)", () => {
  test("cart displays the correct product after adding one item", async ({
    page,
  }) => {
    await addProductAndGoToCart(page, "Blue Top");

    const cartPage = new CartPage(page);
    await expect(cartPage.rowByProductName("Blue Top")).toBeVisible();
  });

  test("cart total for an item equals its price times its quantity", async ({
    page,
  }) => {
    await addProductAndGoToCart(page, "Blue Top");

    const cartPage = new CartPage(page);
    const row = cartPage.rowByProductName("Blue Top");

    const priceText = await row.locator(".cart_price p").innerText();
    const quantityText = await row.locator(".cart_quantity button").innerText();
    const totalText = await row
      .locator(".cart_total .cart_total_price")
      .innerText();

    const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));
    const quantity = parseInt(quantityText, 10);
    const total = parseFloat(totalText.replace(/[^0-9.]/g, ""));

    expect(total).toBeCloseTo(price * quantity, 2);
  });

  test("removing an item empties the cart", async ({ page }) => {
    await addProductAndGoToCart(page, "Blue Top");

    const cartPage = new CartPage(page);
    await cartPage.removeItem("Blue Top");
    await expect(cartPage.cartRows).toHaveCount(0);
  });

  test("proceeding to checkout without logging in prompts registration", async ({
    page,
  }) => {
    await addProductAndGoToCart(page, "Blue Top");

    const cartPage = new CartPage(page);
    await cartPage.proceedToCheckout();
    await expect(cartPage.registerLoginLink).toBeVisible();
  });

  test("a logged-in user can complete checkout and see the order confirmation", async ({
    page,
    request,
  }) => {
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

    await addProductAndGoToCart(page, "Blue Top");

    const cartPage = new CartPage(page);
    await cartPage.proceedToCheckout();
    await expect(page.getByText("Review Your Order")).toBeVisible();

    await cartPage.placeOrder("Please deliver in the afternoon.");
    await cartPage.fillPaymentDetails({
      nameOnCard: "Plain Spec",
      cardNumber: "4111111111111111",
      cvc: "123",
      expiryMonth: "12",
      expiryYear: "2030",
    });

    await cartPage.expectOrderConfirmed();
  });
});
