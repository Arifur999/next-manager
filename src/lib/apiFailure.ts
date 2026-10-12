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

export const logApiFailure = (context: string, error: unknown) => {
  const failure = describeApiFailure(error);
  const fields: LogFields = { ...failure };
  const isClientError = failure.status !== undefined && failure.status < 500;

  if (isClientError) logger.warn(`${context} failed`, fields);
  else logger.error(`${context} failed`, fields);
};
