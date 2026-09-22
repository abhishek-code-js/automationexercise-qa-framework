// tests/ui/products.spec.ts
import { test, expect } from "@playwright/test";
import { ProductsPage } from "../../src/pages/ProductsPage";

test.describe("Products (plain spec)", () => {
  test("the products page lists more than 0 products", async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.goto();

    const names = await productsPage.getAllProductNames();
    expect(names.length).toBeGreaterThan(0);
  });

  test("searching for a product shows search results", async ({ page }) => {
    const productsPage = new ProductsPage(page);

    await productsPage.goto();
    await productsPage.search("Dress");

    const names = await productsPage.getAllProductNames();

    expect(names.length).toBeGreaterThan(0);
  });

  test('adding a product to the cart from the listing shows the "Added!" confirmation', async ({
    page,
  }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.goto();

    await productsPage.addToCartByName("Blue Top");
    await productsPage.expectAddedToCartModal();
  });

  test("opening a product's detail page shows the correct name", async ({
    page,
  }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.goto();

    await productsPage.openProductDetail("Blue Top");
    await expect(page.locator(".product-information h2")).toHaveText(
      "Blue Top",
    );
  });

  test("expanding a category and opening a subcategory filters the product list", async ({
    page,
  }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.goto();

    await productsPage.expandCategory("Women");
    await productsPage.openSubcategory("Women", "Dress");

    await expect(page.locator(".title.text-center")).toContainText("Dress");
  });
});
