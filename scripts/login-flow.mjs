/**
 * The contract sign-in depends on, checked from the frontend's side.
 *
 * Why this exists: every other suite here signs in by calling the API and
 * keeping its Set-Cookie, which is not what a browser does. A browser posts to
 * a Next server action, and THAT calls the API - so the API's Set-Cookie lands
 * on a server-side Response the browser never sees, and the action has to
 * carry the session across itself.
 *
 * When the API stopped putting tokens in the login body, sign-in broke
 * completely and 118 journey steps, a 66x4 route matrix and 144 nav links all
 * still passed, because not one of them went through that action.
 *
 * This checks the seam. It does not drive the action itself - the login form
 * calls it as a client mutation with an action id, and there is no browser
 * here - so it asserts the exact thing the action consumes, which is what
 * changed underneath it.
 */

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";
const stamp = Date.now();
const email = `loginflow${stamp}@agencio.test`;

let bad = 0;
const check = (name, ok, detail = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  (" + detail + ")" : ""}`);
  if (!ok) bad++;
};

const post = (path, body, headers = {}) =>
  fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

console.log("\n--- the sign-in seam ---\n");

await post("/auth/register", {
  organization_name: "Login Flow Co",
  full_name: "Login Flow Admin",
  email,
  password: "Passw0rd123",
});

// Exactly how the server action calls it: a plain fetch with no cookie jar.
const res = await post("/auth/login", { email, password: "Passw0rd123" });
const body = await res.json();

check("the API accepts the credentials", res.status === 200, `${res.status} ${body.message}`);

// getSetCookie, not get("set-cookie"): the joined form is unparseable because
// Expires dates contain commas.
const headers = res.headers.getSetCookie?.() ?? [];
const parsed = new Map();
for (const header of headers) {
  const [pair, ...attributes] = header.split(";");
  const equals = pair.indexOf("=");
  if (equals === -1) continue;
  const maxAge = attributes
    .map((a) => a.trim())
    .find((a) => a.toLowerCase().startsWith("max-age="))
    ?.split("=")[1];
  parsed.set(pair.slice(0, equals).trim(), { value: pair.slice(equals + 1).trim(), maxAge: Number(maxAge) });
}

// THE check. Without these two headers the login action has nothing to give
// the browser and sign-in is over, however healthy everything else looks.
check("it sets an accessToken cookie", parsed.has("accessToken"), headers.length + " Set-Cookie header(s)");
check("and a refreshToken cookie", parsed.has("refreshToken"));

const access = parsed.get("accessToken");
const refresh = parsed.get("refreshToken");

check("the access token is a JWT, not a placeholder", (access?.value ?? "").split(".").length === 3);
check("with a lifetime the action can copy", Number.isFinite(access?.maxAge) && access.maxAge > 0, String(access?.maxAge));
check("the refresh token outlives it", (refresh?.maxAge ?? 0) > (access?.maxAge ?? 0), `${refresh?.maxAge} > ${access?.maxAge}`);

// And it still decodes to the person who signed in, so the proxy can read a
// role off it without a round trip.
let claims = {};
try {
  claims = JSON.parse(Buffer.from((access?.value ?? "").split(".")[1] ?? "", "base64url").toString());
} catch { /* left empty, the check below reports it */ }
check("and carries the role the proxy routes on", typeof claims.role === "string", JSON.stringify(claims.role));
check("and an expiry", typeof claims.exp === "number");

// The security half: the tokens must NOT also be in the body, where script
// could read them.
check("the body carries no access token", !("accessToken" in (body.data ?? {})));
check("nor a refresh token", !("refreshToken" in (body.data ?? {})));
check("but does say who signed in", body.data?.user?.email === email, body.data?.user?.email);

// Refresh has to keep the same shape, because the proxy renews sessions with it.
const refreshRes = await post("/auth/refresh-token", undefined, { Cookie: `refreshToken=${refresh?.value}` });
const refreshCookies = refreshRes.headers.getSetCookie?.() ?? [];
check("refresh returns 200", refreshRes.status === 200, String(refreshRes.status));
check("and rotates both cookies", refreshCookies.filter((c) => /^(access|refresh)Token=/.test(c)).length === 2, `${refreshCookies.length}`);

console.log(bad ? `\n${bad} PROBLEM(S) - sign-in is broken\n` : "\nTHE SIGN-IN SEAM HOLDS\n");

// exitCode rather than exit(): calling exit() while fetch still holds a
// keep-alive socket trips a libuv assertion on Windows and reports 127, which
// would read as a broken suite rather than a passing one.
process.exitCode = bad ? 1 : 0;
