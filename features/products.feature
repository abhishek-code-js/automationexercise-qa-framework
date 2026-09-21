Feature: Products
  As a shopper browsing automationexercise.com
  I want to search, filter, and view products
  So that I can find what I want to buy

Scenario: All products are listed on the Products page
    Given I am on the products page
    Then I should see more than 0 products listed


Scenario: Searching for a product displays search results
  Given I am on the products page
  When I search for "Dress"
  Then I should see the "Searched Products" heading
  And the search results should not be empty

Scenario: Viewing a category subcategory filters the product list
    Given I am on the products page
    When I expand the "Women" category and open "Dress"
    Then the page heading should mention "Dress"

Scenario: Adding a product to the cart from the listing shows a confirmation
    Given I am on the products page
    When I add "Blue Top" to the cart from the listing
    Then I should see the "Added!" confirmation

Scenario: Opening a product's detail page shows the correct name
    Given I am on the products page
    When I open the detail page for "Blue Top"
    Then the product detail heading should show "Blue Top"

Scenario: Adding a product to cart from its detail page with a specific quantity
    Given I am on the products page
    When I open the detail page for "Blue Top"
    And I set the quantity to 4 and add it to the cart
    And I view the cart from the confirmation modal
    Then the cart should show a quantity of 4 for "Blue Top"