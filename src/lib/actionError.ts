/**
 * Turns whatever an action caught into a message worth showing.
 *
 * Lifted out of the individual `_action.ts` files once there were more than a
 * couple of them: the axios-shape check is fiddly enough that copies of it
 * drift, and the one thing every copy must do is prefer the BACKEND's own
 * message. Without that the user reads "Request failed with status code 409"
 * instead of "An account with this name already exists".
 */
export const getActionErrorMessage = (error: unknown, fallbackMessage: string): string => {
    if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
    ) {
        return error.response.data.message
    }

    if (error instanceof Error) {
        return error.message
    }

    return fallbackMessage
}
