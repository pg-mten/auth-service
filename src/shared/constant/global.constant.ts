import 'dotenv/config';

export const VERSION = process.env.VERSION || 'v1';
export const API_PREFIX = `/api/${VERSION}`;

export const PORT: number = parseInt(process.env.PORT || '3000');

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_TEST = process.env.NODE_ENV === 'test';

export const JWT = {
  accessToken: {
    secret: process.env.JWT_ACCESS_TOKEN_SECRET ?? '',
    expireIn: 3600 * 1, // 1 Hour Dev
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_TOKEN_SECRET ?? '',
    expireIn: 3600 * 24, // 24 Hour Dev
  },
};
