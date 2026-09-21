Feature: Cart and Checkout
  As a shopper with items in my cart
  I want to review, adjust, and pay for my order
  So that my purchase completes correctly

  Scenario: Cart displays the correct product after adding one item
    Given I add "Blue Top" to the cart and go to the cart page
    Then the cart should contain "Blue Top"

  Scenario: Cart calculates the correct total price for an item
    Given I add "Blue Top" to the cart and go to the cart page
    Then the cart total for that item should be its price times its quantity

  Scenario: Removing an item empties the cart
    Given I add "Blue Top" to the cart and go to the cart page
    When I remove that item from the cart
    Then the cart should be empty

  Scenario: Proceeding to checkout without logging in prompts registration
    Given I add "Blue Top" to the cart and go to the cart page
    When I try to proceed to checkout
    Then I should be prompted to register or log in

  Scenario: A logged-in user can proceed to checkout and see the order review
    Given I am logged in with a registered test account
    And I add "Blue Top" to the cart and go to the cart page
    When I proceed to checkout
    Then I should see the order review page

  Scenario: Completing payment shows the order confirmation
    Given I am logged in with a registered test account
    And I add "Blue Top" to the cart and go to the cart page
    When I proceed to checkout
    And I place the order
    And I complete payment with test card details
    Then I should see the order confirmation message