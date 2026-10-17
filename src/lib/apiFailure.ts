import { logger, type LogFields } from "./logger";

// What may leave the process about a failed API call. Built field by field from
// an allowlist so headers, cookies, bodies and the error object never reach a log.
export interface ApiFailure {
  method?: string;
  path?: string;
  status?: number;
  code?: string;
  apiMessage?: string;
  requestId?: string;
}

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  value !== null && typeof value === "object" ? (value as Record<string, unknown>) : undefined;

const asString = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);

const stripQuery = (url: string) => url.split("?")[0];

const readApiMessage = (data: unknown): string | undefined => {
  const message = asRecord(data)?.message;
  if (typeof message === "string") return message;
  if (Array.isArray(message)) return asString(message[0]);
  return undefined;
};

const readRequestId = (headers: unknown): string | undefined => {
  const record = asRecord(headers);
  return asString(record?.["x-request-id"]);
};

export const describeApiFailure = (error: unknown): ApiFailure => {
  const record = asRecord(error);
  const config = asRecord(record?.config);
  const response = asRecord(record?.response);
  const url = asString(config?.url);
  const status = typeof response?.status === "number" ? response.status : undefined;

  return {
    method: asString(config?.method)?.toUpperCase(),
    path: url ? stripQuery(url) : undefined,
    status,
    code: status === undefined ? asString(record?.code) ?? asString(record?.name) : undefined,
    apiMessage: readApiMessage(response?.data),
    requestId: readRequestId(response?.headers),
  };
};

const logFailure = (context: string, failure: ApiFailure) => {
  const fields: LogFields = { ...failure };
  const isClientError = failure.status !== undefined && failure.status < 500;

  if (isClientError) logger.warn(`${context} failed`, fields);
  else logger.error(`${context} failed`, fields);
};

export const logApiFailure = (context: string, error: unknown) => logFailure(context, describeApiFailure(error));

// Thrown past httpClient instead of the axios error, which carries the request's
// Cookie header. Next logs whatever escapes a server action or component in
// full, so only the allowlisted description may travel on.
export class ApiRequestError extends Error {
  readonly failure: ApiFailure;

  constructor(context: string, failure: ApiFailure) {
    super(failure.status === undefined ? `${context} failed` : `${context} failed with ${failure.status}`);
    this.name = "ApiRequestError";
    this.failure = failure;
  }
}

// Logs a failed call and returns the error that is safe to throw.
export const reportApiFailure = (context: string, error: unknown): ApiRequestError => {
  const failure = describeApiFailure(error);
  logFailure(context, failure);
  return new ApiRequestError(context, failure);
};

// A record that is not there for this user: 404 for an unknown or another
// tenant's id, 400 for an id that is not one. A detail page shows "not found"
// for these and an error with Retry for anything else.
export const isMissingRecordError = (error: unknown): boolean =>
  error instanceof ApiRequestError && (error.failure.status === 404 || error.failure.status === 400);
