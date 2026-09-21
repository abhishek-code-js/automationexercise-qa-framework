import { Page, Locator, expect } from "@playwright/test";

export class ProductsPage {
  readonly page: Page;

  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly productCards: Locator;

  readonly addToCartModal: Locator;
  readonly continueShoppingButton: Locator;
  readonly viewCartLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.searchInput = page.locator("#search_product");

    this.searchButton = page.locator("#submit_search");

    this.productCards = page.locator(".product-image-wrapper");

    this.addToCartModal = page.locator(".modal-content");

    this.continueShoppingButton = page.getByRole("button", {
      name: "Continue Shopping",
    });

    this.viewCartLink = page.getByRole("link", {
      name: "View Cart",
    });
  }

  // ==================================================
  // Products page
  // ==================================================

  async goto() {
    await this.page.goto("/products", {
      waitUntil: "domcontentloaded",
    });
  }

  // ==================================================
  // Search
  // ==================================================

  async search(term: string) {
    await this.searchInput.fill(term);

    await this.searchButton.click();

    await expect(
      this.page.getByRole("heading", {
        name: "Searched Products",
      }),
    ).toBeVisible();
  }

  // ==================================================
  // Product card
  // ==================================================

  cardByName(name: string): Locator {
    return this.productCards.filter({
      hasText: name,
    });
  }

  // ==================================================
  // Add to cart from listing
  // ==================================================

  async addToCartByName(name: string) {
    const card = this.cardByName(name).first();

    await expect(card).toBeVisible();

    await card.hover();

    await card.locator("a.add-to-cart").first().click();
  }

  // ==================================================
  // Added confirmation
  // ==================================================

  async expectAddedToCartModal() {
    await expect(this.addToCartModal).toContainText("Added!");
  }

  // ==================================================
  // Product detail
  // ==================================================

  async openProductDetail(name: string) {
    const card = this.cardByName(name).first();

    await expect(card).toBeVisible();

    const viewProductLink = card.locator('a[href^="/product_details/"]');

    await expect(viewProductLink).toBeVisible();

    console.log("BEFORE CLICK:", await this.page.url());
    console.log("HREF:", await viewProductLink.getAttribute("href"));

    await viewProductLink.click();

    await this.page.waitForLoadState("domcontentloaded");

    console.log("AFTER CLICK:", await this.page.url());
    console.log("TITLE:", await this.page.title());
  }

  // ==================================================
  // Categories
  // ==================================================

  async expandCategory(categoryName: string) {
    const category = this.page
      .locator(".category-products")
      .locator("a")
      .filter({
        hasText: categoryName,
      })
      .first();

    await expect(category).toBeVisible();

    await category.click();
  }

  async openSubcategory(categoryName: string, subcategoryName: string) {
    const category = this.page.locator(`a[href="#${categoryName}"]`);

    await expect(category).toBeVisible();
    await category.click();

    const subcategory = this.page.locator('a[href="/category_products/1"]');

    await expect(subcategory).toBeVisible();
    await subcategory.click();
  }

  // ==================================================
  // Product names
  // ==================================================

  async getAllProductNames(): Promise<string[]> {
    return this.page
      .locator(".features_items .productinfo p")
      .allTextContents();
  }
}
