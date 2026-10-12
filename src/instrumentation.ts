import { getEnv } from "./env";

// Fail at boot, naming the missing variable, instead of on the first request.
export function register() {
  getEnv();
}
