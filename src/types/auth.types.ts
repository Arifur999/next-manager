import { type IUser } from "./user.types";

export interface ILoginResponse {
    accessToken: string;
    refreshToken: string;
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
