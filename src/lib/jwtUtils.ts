import jwt, { type JwtPayload } from 'jsonwebtoken';

const verifyToken = (token: string, secret: string) => {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return {
      success: true,
      decoded,
      message: 'Token verified successfully',
    };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
      error: error,
    };
  }
};

const decodeToken = (token: string) => {
  return jwt.decode(token) as JwtPayload;
};

export const jwtUtils = { verifyToken, decodeToken };
