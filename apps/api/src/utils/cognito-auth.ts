import { createHash } from 'node:crypto';

import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import { TRPCError } from '@trpc/server';

import { Context } from './trpc';
import { db } from './db';
import { getTimestampDaysFromNow } from './miscellaneous';

type Tokens = {
  id_token: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

// The returned cognito user has many more properties but we aren't going to use them
export type CognitoUser = {
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
    throw new Error('No matching key found.');
  }

  return jwk;
}

// Validate ID token
export async function validateToken(token: string) {
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
async function refreshToken(idTokenHash: string) {
  try {
    const {
      data: [session],
    } = await db.entities.sessions.query.primaryKey({ id: idTokenHash }).go();

    if (!session) {
      throw new Error('Token expired and no refresh token available.');
    }

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
        refresh_token: session.refreshToken,
      }),
    };

    const response = await fetch(tokenUrl, options);
    const result: Omit<Tokens, 'refresh_token'> = await response.json();

    // Delete previous session
    db.entities.sessions
      .delete({ id: idTokenHash, userId: session.userId })
      .go();

    // Create new session
    const newIdTokenHash = createHash('sha256')
      .update(result.id_token)
      .digest('hex');

    db.entities.sessions
      .create({
        id: newIdTokenHash,
        refreshToken: session.refreshToken,
        userId: session.userId,
        expiresAt: getTimestampDaysFromNow(365), // Refresh token expiration
      })
      .go();

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

    if (!idToken) throw new Error('No id token.');

    try {
      // Try to validate the current token
      const user = (await validateToken(idToken)) as CognitoUser;
      return user;
    } catch (error) {
      // Since id token is not valid anymore we'll get refresh token from db
      // Hash of id token used bc the token itself is too large for DynamoDB sk
      const idTokenHash = createHash('sha256').update(idToken).digest('hex');

      const newTokens = await refreshToken(idTokenHash);
      // Set new cookie
      setToken({ res, idToken: newTokens.id_token });

      // Validate the new ID token
      const user = (await validateToken(newTokens.id_token)) as CognitoUser;
      return user;
    }
  } catch (error) {
    res.clearCookie('id_token');

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
  const idToken = req.cookies.id_token;

  if (!idToken) {
    // No token to revoke but clear all tokens from cookies anyway
    res.clearCookie('id_token');

    return { message: 'No token to be revoked.' };
  }

  try {
    // Get refresh token from db
    // Hash of id token used bc the token itself is too large for DynamoDB sk
    const idTokenHash = createHash('sha256').update(idToken).digest('hex');

    const {
      data: [session],
    } = await db.entities.sessions.query.primaryKey({ id: idTokenHash }).go();

    if (!session) {
      throw new Error('No token available to be revoked.');
    }

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
      body: new URLSearchParams({
        client_id: clientId!,
        token: session.refreshToken,
      }),
    };

    const response = await fetch(revokeTokenUrl, options);

    if (response.ok) {
      res.clearCookie('id_token');

      // Delete session
      db.entities.sessions
        .delete({ id: idTokenHash, userId: session.userId })
        .go();

      return { message: 'Token revoked' };
    } else {
      throw new Error('Token revocation request was not successful.');
    }
  } catch (error) {
    console.error('Token revocation error: ', error);

    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: (error as Error).message,
    });
  }
}

// Set token in cookies
export function setToken({
  res,
  idToken,
}: {
  res: Context['res'];
  idToken: string;
}) {
  res.cookie('id_token', idToken, {
    ...cookieOptions,
    maxAge: 1000 * 60 * 60 * 24 * 365, // Refresh token expiration (so it can be exchanged)
  });
}
