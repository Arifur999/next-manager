import { type IUser } from "./user.types";

/**
 * What /auth/login actually returns.
 *
 * No tokens. They come back as Set-Cookie headers and are forwarded to the
 * browser by the login action - the body carries only who signed in.
 *
 * This declared them for a while after the API stopped sending them, and
 * nothing caught it: the action destructures a body typed `any` off
 * res.json(), so TypeScript had nothing to check the claim against and
 * compiled clean over an outage. The type is narrow now so the next
 * disagreement is a build error rather than a login that silently sets no
 * cookies.
 */
export interface ILoginResponse {
    user: IUser;
}

export interface IAccessTokenPayload {
    userId: string;
    email: string;
    role: string;
    tokenVersion?: number;
    iat?: number;
    exp?: number;
}
