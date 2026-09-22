import { test, expect } from "@playwright/test";

const BASE = "https://dummyjson.com";

test("1. POST /auth/login with valid credentials returns a real JWT", async ({
  request,
}) => {
  const res = await request.post(`${BASE}/auth/login`, {
    data: { username: "emilys", password: "emilyspass" },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();

  expect(body.accessToken).toBeTruthy();
  // A JWT is always three base64url segments joined by dots
  // (header.payload.signature) — a cheap, useful shape-check even
  // without cryptographically verifying the signature.
  expect(body.accessToken.split(".")).toHaveLength(3);
});

test("2. POST /auth/login with a wrong password is rejected", async ({
  request,
}) => {
  const res = await request.post(`${BASE}/auth/login`, {
    data: { username: "emilys", password: "wrong-password" },
  });
  expect(res.status()).toBe(400);
});

test("3. AUTHENTICATION: GET /auth/me with a valid Bearer token returns the matching user", async ({
  request,
}) => {
  const loginRes = await request.post(`${BASE}/auth/login`, {
    data: { username: "emilys", password: "emilyspass" },
  });
  const { accessToken } = await loginRes.json();

  const meRes = await request.get(`${BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  expect(meRes.status()).toBe(200);
  const me = await meRes.json();
  expect(me.username).toBe("emilys");
});

test("4. AUTHORIZATION: GET /auth/me with NO token is rejected", async ({
  request,
}) => {
  const res = await request.get(`${BASE}/auth/me`);
  expect(res.status()).toBe(401);
});

test("5. AUTHORIZATION: GET /auth/me with a malformed/invalid token is rejected", async ({
  request,
}) => {
  const res = await request.get(`${BASE}/auth/me`, {
    headers: { Authorization: "Bearer this.is.not.a.real.token" },
  });
  expect([401, 403]).toContain(res.status());
});

test("6. POST /auth/refresh returns a valid access token", async ({
  request,
}) => {
  const loginRes = await request.post(`${BASE}/auth/login`, {
    data: {
      username: "emilys",
      password: "emilyspass",
    },
  });

  expect(loginRes.status()).toBe(200);

  const loginBody = await loginRes.json();

  const refreshRes = await request.post(`${BASE}/auth/refresh`, {
    data: {
      refreshToken: loginBody.refreshToken,
    },
  });

  expect(refreshRes.status()).toBe(200);

  const refreshBody = await refreshRes.json();

  expect(refreshBody.accessToken).toBeTruthy();
  expect(refreshBody.accessToken.split(".")).toHaveLength(3);
});
