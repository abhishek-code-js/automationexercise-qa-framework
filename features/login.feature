Feature: Login and Signup
    As a shopper on automationexercise.com
    I want to create an account and log in
    So that I can place orders under my own identity

Scenario: A new user can sign up with a unique email and the account is created
    Given I am on the login page
    When I sign up with a unique email
    Then I should be redirected to the account information page
    When I fill in and submit my account details
    Then I should see the account created confirmation
    When I continue after account creation
    Then I should be logged in

Scenario: Signing up twice with the same email is rejected
    Given I am on the login page
    When I sign up with a unique email
    And I fill in and submit my account details
    And I continue after account creation
    And I log out
    And I try to sign up again with the same email
    Then I should see an error that the email already exists

Scenario: A registered user can log in successfully
    Given I have a registered test account
    And I am on the login page
    When I log in with that account's credentials
    Then I should be logged in

Scenario: Login fails with an incorrect password for a registered account
    Given I have a registered test account
    And I am on the login page
    When I log in with that email but an incorrect password
    Then I should see an incorrect login error

Scenario: Login fails with a non-existent email
    Given I am on the login page
    When I try to log in with a non-existent email
    Then I should see an incorrect login error


Scenario: A logged-in user can log out
    Given I have a registered test account
    And I am on the login page
    When I log in with that account's credentials
    And I log out
    Then I should be on the login page