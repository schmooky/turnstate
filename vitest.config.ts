import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      reporter: ["text", "lcov"],
      provider: "v8",
      lines: 90,
      functions: 90,
      branches: 90,
      statements: 90
    }
  }
});
