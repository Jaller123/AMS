import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Lägg till event listeners här om det behövs
    },
    baseUrl: "http://localhost:5173",
  },
});
