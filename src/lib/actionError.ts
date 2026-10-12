// Turns whatever an action caught into a message worth showing. The backend's
// own message wins; raw Error text never reaches the browser, because it can
// carry internal addresses ("connect ECONNREFUSED 172.18.0.3:5000").

export const UNREACHABLE_MESSAGE = "Unable to reach the server. Try again in a moment."

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
    value !== null && typeof value === "object" ? (value as Record<string, unknown>) : undefined

const readApiMessage = (error: unknown): string | undefined => {
    const response = asRecord(asRecord(error)?.response)
    const message = asRecord(response?.data)?.message
    if (typeof message === "string" && message) return message
    if (Array.isArray(message) && typeof message[0] === "string") return message[0]
    return undefined
}

// An axios error that never got a response, or a fetch that failed before one.
const isNetworkFailure = (error: unknown): boolean => {
    const record = asRecord(error)
    if (!record) return false
    if (record.isAxiosError === true) return record.response === undefined
    return error instanceof TypeError && error.message === "fetch failed"
}

export const getActionErrorMessage = (error: unknown, fallbackMessage: string): string => {
    const apiMessage = readApiMessage(error)
    if (apiMessage) return apiMessage
    if (isNetworkFailure(error)) return UNREACHABLE_MESSAGE
    return fallbackMessage
}
