import { ApiRequestError } from "@/lib/apiFailure"

// 404 for a record that is gone or belongs to another company, 400 for an id
// that is not one at all. Either way there is nothing to retry.
export const isMissingRecord = (error: unknown): boolean =>
  error instanceof ApiRequestError && (error.failure.status === 404 || error.failure.status === 400)
