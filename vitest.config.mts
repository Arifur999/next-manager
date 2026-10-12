import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Same "@/..." alias as tsconfig, so tested modules can import the way app code does.
// TZ is pinned so date formatting in tests does not depend on the machine.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: { TZ: "UTC" },
  },
});
