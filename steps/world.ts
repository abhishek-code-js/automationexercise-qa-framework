import { test as base } from "playwright-bdd";

export interface ScenarioState {
  email?: string;
  password?: string;
  productName?: string;
}

export const test = base.extend<{ state: ScenarioState }>({
  state: async ({}, use) => {
    await use({});
  },
});
