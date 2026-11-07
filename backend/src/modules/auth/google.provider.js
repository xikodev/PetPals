const { createPublicKey, verify } = require('node:crypto');
const { equalSecret } = require('./auth.security');

// Google-only OpenID Connect verifier. Never follow URLs supplied by a JWT.
// Fixed issuer, algorithm and JWKS endpoint; no arbitrary JWT algorithms/providers.
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const KEYS_URL = 'https://www.googleapis.com/oauth2/v3/certs';

function verifyGoogleToken(token, keys, clientId, nonce, now = Date.now()) {
  if (typeof token !== 'string' || token.length > 20000) throw new Error('Invalid ID token');
  const parts = token.split('.');
  if (parts.length !== 3 || parts.some((part) => !/^[A-Za-z0-9_-]+$/.test(part))) {
    throw new Error('Invalid ID token');
  }
  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
  const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
  if (header.alg !== 'RS256' || typeof header.kid !== 'string' || header.crit) {
    throw new Error('Invalid token algorithm');
  }
  const key = keys.find((candidate) => candidate.kid === header.kid
    && candidate.kty === 'RSA' && (!candidate.use || candidate.use === 'sig')
    && (!candidate.alg || candidate.alg === 'RS256'));
  if (!key || !verify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`),
    createPublicKey({ key, format: 'jwk' }), Buffer.from(parts[2], 'base64url'))) {
    throw new Error('Invalid token signature');
  }
  const seconds = now / 1000;
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(claims.iss)
      || claims.aud !== clientId || (claims.azp && claims.azp !== clientId)
      || !Number.isFinite(claims.exp) || claims.exp <= seconds
      || !Number.isFinite(claims.iat) || claims.iat > seconds + 60
      || (claims.nbf !== undefined && (!Number.isFinite(claims.nbf) || claims.nbf > seconds))
      || !equalSecret(claims.nonce, nonce)
      || typeof claims.sub !== 'string' || !claims.sub || claims.sub.length > 255
      || claims.email_verified !== true || typeof claims.email !== 'string' || !claims.email) {
    throw new Error('Invalid token claims');
  }
  return {
    subject: claims.sub,
    email: claims.email,
    firstName: typeof claims.given_name === 'string' ? claims.given_name : '',
    lastName: typeof claims.family_name === 'string' ? claims.family_name : '',
    photoUrl: typeof claims.picture === 'string' && claims.picture.startsWith('https://') ? claims.picture : null,
  };
}

function createGoogleProvider(config, request = fetch) {
  let cachedKeys;
  let keysExpireAt = 0;
  function authorizationUrl({ state, nonce, challenge }) {
    const url = new URL(AUTH_URL);
    url.search = new URLSearchParams({
      client_id: config.clientId, redirect_uri: config.callbackUrl,
      response_type: 'code', scope: 'openid email profile', state, nonce,
      code_challenge: challenge, code_challenge_method: 'S256', prompt: 'select_account',
    }).toString();
    return url.toString();
  }
  async function exchange(code, verifier, nonce) {
    const response = await request(TOKEN_URL, {
      method: 'POST', signal: AbortSignal.timeout(10000),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, code_verifier: verifier, client_id: config.clientId,
        client_secret: config.clientSecret, redirect_uri: config.callbackUrl, grant_type: 'authorization_code' }),
    });
    if (!response.ok) throw new Error('Google token exchange failed');
    const tokens = await response.json();
    // Fetch keys on expiration, and once on rotation of a previously unseen key.
    let kid;
    try { kid = JSON.parse(Buffer.from(tokens.id_token.split('.')[0], 'base64url')).kid; }
    catch { throw new Error('Google returned an invalid ID token'); }
    if (!cachedKeys || Date.now() >= keysExpireAt || !cachedKeys.some((key) => key.kid === kid)) {
      const result = await request(KEYS_URL, { signal: AbortSignal.timeout(10000) });
      if (!result.ok) throw new Error('Google key lookup failed');
      const body = await result.json();
      if (!Array.isArray(body.keys)) throw new Error('Invalid Google keys');
      cachedKeys = body.keys;
      const maxAge = Number(/max-age=(\d+)/.exec(result.headers.get('cache-control') || '')?.[1] || 300);
      keysExpireAt = Date.now() + Math.min(maxAge, 3600) * 1000;
    }
    // Google tokens are not stored or exposed to the browser.
    return verifyGoogleToken(tokens.id_token, cachedKeys, config.clientId, nonce);
  }
  return { authorizationUrl, exchange };
}

module.exports = { createGoogleProvider, verifyGoogleToken };
