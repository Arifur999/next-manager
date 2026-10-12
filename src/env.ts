import "server-only";

import { z } from "zod";

// Read on first use, not at import: `next build` and `docker build` run
// without runtime env, and only a booting server needs these values.
const isProduction = process.env.NODE_ENV === "production";

const schema = z.object({
  API_BASE_URL: z.url().optional(),
  // Deprecated alias kept for one release so compose files can switch at their own pace.
  API_INTERNAL_URL: z.url().optional(),
  JWT_ACCESS_SECRET: z.string().min(1),
  SITE_URL: z.url().optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export interface ServerEnv {
  API_BASE_URL: string;
  JWT_ACCESS_SECRET: string;
  SITE_URL: string | undefined;
  LOG_LEVEL: "debug" | "info" | "warn" | "error";
}

let cached: ServerEnv | undefined;

const describeIssues = (error: z.ZodError) =>
  error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");

const defaultApiBaseUrl = isProduction ? undefined : "http://localhost:5000/api/v1";

export const getEnv = (): ServerEnv => {
  if (cached) return cached;

  const parsed = schema.safeParse(process.env);
  const apiBaseUrl = parsed.success
    ? parsed.data.API_BASE_URL ?? parsed.data.API_INTERNAL_URL ?? defaultApiBaseUrl
    : undefined;

  const problems = parsed.success ? [] : [describeIssues(parsed.error)];
  if (parsed.success && !apiBaseUrl) problems.push("API_BASE_URL: not set, the server has no route to the API");
  if (!parsed.success || !apiBaseUrl) {
    throw new Error(`Invalid server environment: ${problems.join("; ")}`);
  }

  cached = {
    API_BASE_URL: apiBaseUrl,
    JWT_ACCESS_SECRET: parsed.data.JWT_ACCESS_SECRET,
    SITE_URL: parsed.data.SITE_URL ?? (isProduction ? undefined : "http://localhost:3000"),
    LOG_LEVEL: parsed.data.LOG_LEVEL,
  };
  return cached;
};

export const getApiBaseUrl = () => getEnv().API_BASE_URL;

/**
 * The public site origin, for metadata, the sitemap and JSON-LD. Read on its
 * own so pages that only need the URL do not depend on the API or JWT
 * settings. Falls back to localhost when SITE_URL is unset; production sets it.
 */
export const getPublicSiteUrl = (): string => {
  const parsed = z.url().safeParse(process.env.SITE_URL);
  const url = parsed.success ? parsed.data : "http://localhost:3000";
  return url.replace(/\/+$/, "");
};
