import jwt, { type JwtPayload } from 'jsonwebtoken';

export type VerifyResult =
  | { success: true; decoded: JwtPayload }
  | { success: false; reason: 'expired' | 'invalid' };

// "expired" is told apart from "invalid" so the proxy can renew an expired
// session but never one whose signature does not check out.
const verifyToken = (token: string, secret: string): VerifyResult => {
  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === 'string') return { success: false, reason: 'invalid' };
    return { success: true, decoded };
  } catch (error: unknown) {
    return { success: false, reason: error instanceof jwt.TokenExpiredError ? 'expired' : 'invalid' };
  }
};

const decodeToken = (token: string) => {
  return jwt.decode(token) as JwtPayload;
};

export const jwtUtils = { verifyToken, decodeToken };
