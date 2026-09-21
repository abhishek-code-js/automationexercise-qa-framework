import { createBdd } from "playwright-bdd";
import { expect } from "@playwright/test";
import { test } from "./world";

const { Given } = createBdd(test);

Given("I have a registered test account", async ({ request, state }) => {
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

  const body = await res.json();

  expect(body.responseCode).toBe(201);

  state.email = uniqueEmail;
  state.password = password;
});
