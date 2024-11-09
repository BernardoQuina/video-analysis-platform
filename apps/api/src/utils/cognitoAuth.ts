import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import { TRPCError } from '@trpc/server';

import { Context } from './trpc';

type Tokens = {
  id_token: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

// The returned cognito user has many more properties but we aren't going to use them
type CognitoUser = {
  sub: string;
  given_name: string;
  family_name: string;
  picture: string;
};

const region = process.env.AWS_REGION;
const userPoolId = process.env.COGNITO_USER_POOL_ID;
const cognitoDomain = process.env.COGNITO_DOMAIN;
const clientId = process.env.COGNITO_CLIENT_ID;
const clientSecret = process.env.COGNITO_CLIENT_SECRET;
const frontendUrl = process.env.FRONTEND_URL;

const jwksUri = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

// Fetch JWKs from Cognito
async function fetchJwks() {
  const response = await fetch(jwksUri);
  if (!response.ok) {
    throw new Error(`Failed to fetch JWKS: ${response.statusText}`);
  }
  const data = await response.json();
  return data.keys;
}

// Find matching JWK for a specific token
async function findJwk(token: string) {
  const decodedToken = jwt.decode(token, { complete: true });
  if (!decodedToken) {
    throw new Error('Invalid token');
  }

  const jwks = await fetchJwks();

  const jwk = jwks.find(
    (key: { kid: string }) => key.kid === decodedToken.header.kid,
  );
  if (!jwk) {
    throw new Error('No matching key found');
  }

  return jwk;
}

// Validate ID token
async function validateToken(token: string) {
  try {
    const jwk = await findJwk(token);
    const pem = jwkToPem(jwk);

    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        pem,
        {
          issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
          audience: clientId,
        },
        (err, decoded) => {
          if (err) reject(err);
          resolve(decoded);
        },
      );
    });
  } catch (error) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Token validation failed:  ${(error as Error).message}`,
    });
  }
}

// Refresh tokens using refresh token
async function refreshTokens(refreshToken: string) {
  try {
    const encodedAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64',
    );

    const tokenUrl = `${cognitoDomain}/oauth2/token`;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${encodedAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId!,
        refresh_token: refreshToken!,
      }),
    };

    const response = await fetch(tokenUrl, options);
    const result: Omit<Tokens, 'refresh_token'> = await response.json();

    return result;
  } catch (error) {
    console.error('Token refresh failed: ', error);

    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: (error as Error).message,
    });
  }
}

// Middleware for authentication
export async function authenticate({ req, res }: Context) {
  try {
    const idToken = req.cookies.id_token;
    const refreshToken = req.cookies.refresh_token;

    try {
      // Try to validate the current token
      const user = (await validateToken(idToken)) as CognitoUser;
      return user;
    } catch (error) {
      // If token validation fails and we have a refresh token, try to refresh
      if (!refreshToken) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Token expired and no refresh token available',
        });
      }

      const newTokens = await refreshTokens(refreshToken);
      // Set new cookies
      setTokens({ res, tokens: newTokens });

      // Validate the new ID token
      const user = (await validateToken(newTokens.id_token)) as CognitoUser;
      return user;
    }
  } catch (error) {
    res.clearCookie('id_token');
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    // throw on specific routes if necessary (on the "me" route we don't want to throw)
    return {
      code: 'UNAUTHORIZED' as const,
      message: `Authentication failed:  ${(error as Error).message}`,
    };
  }
}

export async function exchangeCodeForTokens(code: string) {
  try {
    const encodedAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64',
    );

    const tokenUrl = `${cognitoDomain}/oauth2/token`;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${encodedAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId!,
        code,
        redirect_uri: frontendUrl!,
      }),
    };

    const response = await fetch(tokenUrl, options);
    const result: Tokens = await response.json();

    return result;
  } catch (error) {
    console.error('Token exchange error: ', error);

    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: (error as Error).message,
    });
  }
}

export async function revokeTokens({ req, res }: Context) {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    // No token to revoke but clear all tokens from cookies anyway
    res.clearCookie('id_token');
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: 'No token to revoked' };
  }

  try {
    const encodedAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64',
    );

    const revokeTokenUrl = `${cognitoDomain}/oauth2/revoke`;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${encodedAuth}`,
      },
      body: new URLSearchParams({ client_id: clientId!, token: refreshToken! }),
    };

    const response = await fetch(revokeTokenUrl, options);

    if (response.ok) {
      res.clearCookie('id_token');
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      return { message: 'Token revoked' };
    } else {
      throw new Error('Token revocation request was not successful');
    }
  } catch (error) {
    console.error('Token revocation error: ', error);

    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: (error as Error).message,
    });
  }
}

// Set tokens in cookies
export function setTokens({
  res,
  tokens,
}: {
  res: Context['res'];
  tokens: Tokens | Omit<Tokens, 'refresh_token'>;
}) {
  res.cookie('id_token', tokens.id_token, {
    ...cookieOptions,
    maxAge: tokens.expires_in * 1000,
  });
  res.cookie('access_token', tokens.access_token, {
    ...cookieOptions,
    maxAge: tokens.expires_in * 1000,
  });

  if ('refresh_token' in tokens) {
    res.cookie('refresh_token', tokens.refresh_token, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days for refresh token
    });
  }
}
