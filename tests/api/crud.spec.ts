import { test, expect } from "@playwright/test";

const BASE = "https://automationexercise.com/api";

test.describe("Read Endpoints", () => {
  test("GET /productsList returns 200 and a non-empty product list", async ({
    request,
  }) => {
    const res = await request.get(`${BASE}/productsList`);
    const body = await res.json();

    //expect assertions

    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.products)).toBe(true);
    expect(body.products.length).toBeGreaterThan(0);
    expect(body.products[0]).toHaveProperty("id");
    expect(body.products[0]).toHaveProperty("name");
    expect(body.products[0]).toHaveProperty("price");
  });

  test("GET /brandsList returns 200 and a non-empty brand list", async ({
    request,
  }) => {
    const res = await request.get(`${BASE}/brandsList`);
    const body = await res.json();
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.brands)).toBe(true);
    expect(body.brands.length).toBeGreaterThan(0);
  });

  test("POST /searchProduct with a search term returns matching products", async ({
    request,
  }) => {
    const res = await request.post(`${BASE}/searchProduct`, {
      form: { search_product: "Top" },
    });
    const body = await res.json();
    expect(body.responseCode).toBe(200);
    expect(body.products.length).toBeGreaterThan(0);
  });

  test("POST /searchProduct WITHOUT the required param returns a 400 in the body", async ({
    request,
  }) => {
    const res = await request.post(`${BASE}/searchProduct`, { form: {} });
    const body = await res.json();
    expect(res.status()).toBe(200); // this line IS the point of the section-6.1 comment above
    expect(body.responseCode).toBe(400);
    expect(body.message).toContain("search_product parameter is missing");
  });
});

test.describe("Account CRUD", () => {
  const email = `crud.test.${Date.now()}@example.com`;
  const password = "TestPass123!";

  test("CREATE: POST /createAccount creates a new account", async ({
    request,
  }) => {
    const res = await request.post(`${BASE}/createAccount`, {
      form: {
        name: "CRUD Test User",
        email,
        password,
        title: "Mr",
        birth_date: "1",
        birth_month: "1",
        birth_year: "1990",
        firstname: "CRUD",
        lastname: "Test",
        company: "Test Co",
        address1: "1 Test St",
        address2: "",
        country: "India",
        zipcode: "560001",
        state: "Karnataka",
        city: "Bengaluru",
        mobile_number: "9876543210",
      },
    });

    const body = await res.json();
    expect(body.responseCode).toBe(201);
    expect(body.message).toBe("User created!");
  });

  test("READ: GET /getUserDetailByEmail returns the created account's details", async ({
    request,
  }) => {
    const res = await request.get(`${BASE}/getUserDetailByEmail`, {
      params: { email },
    });
    const body = await res.json();
    expect(body.responseCode).toBe(200);
    expect(body.user.email).toBe(email);
    expect(body.user.first_name).toBe("CRUD");
  });

  test("UPDATE: PUT /updateAccount changes the account's name fields", async ({
    request,
  }) => {
    const res = await request.put(`${BASE}/updateAccount`, {
      form: {
        name: "CRUD Test User",
        email,
        password,
        title: "Mrs",
        birth_date: "1",
        birth_month: "1",
        birth_year: "1990",
        firstname: "CRUD-Updated",
        lastname: "Test-Updated",
        company: "Test Co",
        address1: "1 Test St",
        address2: "",
        country: "India",
        zipcode: "560001",
        state: "Karnataka",
        city: "Bengaluru",
        mobile_number: "9876543210",
      },
    });
    const body = await res.json();
    expect(body.responseCode).toBe(200);
    expect(body.message).toBe("User updated!");
  });

  test("DELETE: DELETE /deleteAccount removes the account", async ({
    request,
  }) => {
    const res = await request.delete(`${BASE}/deleteAccount`, {
      form: { email, password },
    });
    const body = await res.json();
    expect(body.responseCode).toBe(200);
    expect(body.message).toBe("Account deleted!");
  });
});

test.describe("Login verification (not JWT — see jwt-auth.spec.ts)", () => {
  test("POST /verifyLogin with valid credentials confirms the user exists", async ({
    request,
  }) => {
    const email = `verify.test.${Date.now()}@example.com`;
    const password = "TestPass123!";
    await request.post(`${BASE}/createAccount`, {
      form: {
        name: "Verify Test",
        email,
        password,
        title: "Mr",
        birth_date: "1",
        birth_month: "1",
        birth_year: "1990",
        firstname: "Verify",
        lastname: "Test",
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

    const res = await request.post(`${BASE}/verifyLogin`, {
      form: { email, password },
    });
    const body = await res.json();
    expect(body.responseCode).toBe(200);
    expect(body.message).toBe("User exists!");

    await request.delete(`${BASE}/deleteAccount`, {
      form: { email, password },
    });
  });

  test("POST /verifyLogin with invalid credentials returns 404 in the body", async ({
    request,
  }) => {
    const res = await request.post(`${BASE}/verifyLogin`, {
      form: {
        email: "definitely-not-a-real-account@example.com",
        password: "wrong",
      },
    });
    const body = await res.json();
    expect(res.status()).toBe(200);
    expect(body.responseCode).toBe(404);
    expect(body.message).toBe("User not found!");
  });
});
