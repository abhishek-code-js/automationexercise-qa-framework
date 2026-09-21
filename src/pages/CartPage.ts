import { Page, Locator, expect } from "@playwright/test";

export class CartPage {
  readonly page: Page;
  readonly cartRows: Locator;
  readonly proceedToCheckoutButton: Locator;
  readonly registerLoginLink: Locator;
  readonly placeOrderLink: Locator;
  readonly orderCommentTextarea: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartRows = page.locator("#cart_info tbody tr");
    this.proceedToCheckoutButton = page.getByText("Proceed To Checkout");
    this.registerLoginLink = page.getByRole("link", {
      name: "Register / Login",
    });
    this.placeOrderLink = page.getByRole("link", { name: "Place Order" });
    this.orderCommentTextarea = page.locator('textarea[name="message"]');
  }

  async goto() {
    await this.page.goto("/view_cart");
  }

  rowByProductName(name: string): Locator {
    return this.cartRows.filter({ hasText: name });
  }

  async removeItem(name: string) {
    await this.rowByProductName(name).locator(".cart_quantity_delete").click();
  }

  async getQuantity(name: string): Promise<string> {
    return (
      (await this.rowByProductName(name)
        .locator(".cart_quantity button")
        .textContent()) ?? ""
    );
  }

  async proceedToCheckout() {
    await this.proceedToCheckoutButton.click();
  }

  async placeOrder(comment?: string) {
    if (comment) await this.orderCommentTextarea.fill(comment);
    await this.placeOrderLink.click();
  }

  async fillPaymentDetails(details: {
    nameOnCard: string;
    cardNumber: string;
    cvc: string;
    expiryMonth: string;
    expiryYear: string;
  }) {
    await this.page
      .locator('[data-qa="name-on-card"]')
      .fill(details.nameOnCard);
    await this.page.locator('[data-qa="card-number"]').fill(details.cardNumber);
    await this.page.locator('[data-qa="cvc"]').fill(details.cvc);
    await this.page
      .locator('[data-qa="expiry-month"]')
      .fill(details.expiryMonth);
    await this.page.locator('[data-qa="expiry-year"]').fill(details.expiryYear);
    await this.page.locator('[data-qa="pay-button"]').click();
  }

  async expectOrderConfirmed() {
    await expect(this.page.getByText("Order Placed!")).toBeVisible();
    await expect(
      this.page.getByText("Congratulations! Your order has been confirmed!"),
    ).toBeVisible();
  }
}
