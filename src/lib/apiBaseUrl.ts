/**
 * Where THIS process reaches the API.
 *
 * Server code and browser code need different answers once nginx is in front,
 * and one variable cannot give both.
 *
 * `NEXT_PUBLIC_API_BASE_URL` is the BROWSER's answer. Next inlines it into the
 * bundle at build time, and useChatSocket derives the chat WebSocket URL from
 * it, so it has to be the public origin - the address a person's browser can
 * actually reach.
 *
 * From inside the web container that same URL points back at the web
 * container, which is why every server-side fetch got ECONNREFUSED against a
 * stack that was otherwise healthy. `API_INTERNAL_URL` is the server's answer:
 * in compose it is http://api:5000/api/v1, straight over the container network
 * with no proxy hop.
 *
 * The public value stays as the fallback, because a dev machine has only that
 * one and needs nothing else.
 *
 * Import this rather than reading the variable. Twelve server-side files read
 * it directly once, and fixing eleven of them is the same as fixing none.
 */
export const SERVER_API_BASE_URL =
    process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_BASE_URL

// Checked here rather than by each caller. Two of them checked it separately
// and one named only NEXT_PUBLIC_API_BASE_URL, so a compose deploy missing
// API_INTERNAL_URL sent the operator to fix a variable that was not the
// problem. One throw, naming both.
if (!SERVER_API_BASE_URL) {
    throw new Error(
        "Neither API_INTERNAL_URL nor NEXT_PUBLIC_API_BASE_URL is set. The server has no route to the API."
    )
}
