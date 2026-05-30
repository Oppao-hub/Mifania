type JwtPayload = {
  exp?: number;
  iat?: number;
  [key: string]: unknown;
};

const decodeBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));

  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(normalized + padding);
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Buffer } = require('buffer');
  return Buffer.from(normalized + padding, 'base64').toString('utf8');
};

export const decodeJwtPayload = (token: string): JwtPayload | null => {
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(parts[1])) as JwtPayload;
  } catch {
    return null;
  }
};

/** True when the JWT is missing, malformed, or past its expiry (with optional leeway). */
export const isJwtExpired = (token: string, leewaySeconds = 30): boolean => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return true;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowSeconds + leewaySeconds;
};

export const isJwtUsable = (token?: string | null): token is string => {
  if (!token || typeof token !== 'string' || token.trim() === '') {
    return false;
  }

  return !isJwtExpired(token);
};
