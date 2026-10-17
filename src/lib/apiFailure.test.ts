import { afterEach, describe, expect, it, vi } from "vitest";
import { inspect } from "node:util";
import { ApiRequestError, describeApiFailure, isMissingRecordError, logApiFailure, reportApiFailure } from "./apiFailure";

const axiosError = (overrides: Record<string, unknown> = {}) => ({
  name: "AxiosError",
  message: "Request failed with status code 404",
  config: {
    method: "get",
    url: "/clients?status=active&search=secret-search",
    headers: { Cookie: "accessToken=SECRET; refreshToken=SECRET2" },
    data: '{"password":"SECRET3"}',
  },
  response: {
    status: 404,
    data: { success: false, message: "Client not found" },
    headers: { "x-request-id": "req-1", "set-cookie": ["accessToken=SECRET"] },
  },
  ...overrides,
});

describe("describeApiFailure", () => {
  it("keeps method, path, status, API message and request id", () => {
    expect(describeApiFailure(axiosError())).toEqual({
      method: "GET",
      path: "/clients",
      status: 404,
      code: undefined,
      apiMessage: "Client not found",
      requestId: "req-1",
    });
  });

  it("never carries cookies, bodies or the query string", () => {
    const serialized = JSON.stringify(describeApiFailure(axiosError()));
    expect(serialized).not.toContain("SECRET");
    expect(serialized).not.toContain("secret-search");
  });

  it("reports the network code when there is no response", () => {
    const failure = describeApiFailure(axiosError({ code: "ECONNREFUSED", response: undefined }));
    expect(failure.status).toBeUndefined();
    expect(failure.code).toBe("ECONNREFUSED");
  });

  it("takes the first message of a string array", () => {
    const failure = describeApiFailure(axiosError({ response: { status: 400, data: { message: ["a", "b"] } } }));
    expect(failure.apiMessage).toBe("a");
  });

  it("survives values that are not errors at all", () => {
    expect(describeApiFailure("boom")).toEqual({});
  });
});

describe("logApiFailure", () => {
  afterEach(() => vi.restoreAllMocks());

  it("logs a 4xx at warn without secrets", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    logApiFailure("GET /clients", axiosError());
    expect(warn).toHaveBeenCalledOnce();
    expect(String(warn.mock.calls[0][0])).not.toContain("SECRET");
  });

  it("logs a refused connection at error", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    logApiFailure("GET /clients", axiosError({ code: "ECONNREFUSED", response: undefined }));
    expect(error).toHaveBeenCalledOnce();
    expect(String(error.mock.calls[0][0])).toContain("ECONNREFUSED");
  });

  it("logs a 5xx at error", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    logApiFailure("GET /clients", axiosError({ response: { status: 502, data: "<html>" } }));
    expect(error).toHaveBeenCalledOnce();
  });
});

describe("reportApiFailure", () => {
  afterEach(() => vi.restoreAllMocks());

  it("logs once and returns an error that carries no cookies, bodies or query string", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = reportApiFailure("GET /clients", axiosError());

    expect(warn).toHaveBeenCalledOnce();
    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error.failure.status).toBe(404);
    expect(error.failure.apiMessage).toBe("Client not found");
    // What Next prints for an error that escapes a server action.
    expect(inspect(error, { depth: 10 })).not.toMatch(/SECRET|secret-search/);
  });

  it("names the status in the message, or just the failure without one", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(reportApiFailure("GET /clients", axiosError({ response: { status: 502, data: "" } })).message).toBe(
      "GET /clients failed with 502",
    );
    expect(reportApiFailure("GET /clients", axiosError({ code: "ECONNRESET", response: undefined })).message).toBe(
      "GET /clients failed",
    );
  });
});

describe("isMissingRecordError", () => {
  it("treats a 404 and a malformed id as a missing record", () => {
    expect(isMissingRecordError(new ApiRequestError("GET /invoices/x", { status: 404 }))).toBe(true);
    expect(isMissingRecordError(new ApiRequestError("GET /invoices/x", { status: 400 }))).toBe(true);
  });

  it("leaves an outage, a refusal and anything else to the error state", () => {
    expect(isMissingRecordError(new ApiRequestError("GET /invoices/x", { status: 500 }))).toBe(false);
    expect(isMissingRecordError(new ApiRequestError("GET /invoices/x", { status: 403 }))).toBe(false);
    expect(isMissingRecordError(new ApiRequestError("GET /invoices/x", {}))).toBe(false);
    expect(isMissingRecordError(new Error("boom"))).toBe(false);
    expect(isMissingRecordError(null)).toBe(false);
  });
});
