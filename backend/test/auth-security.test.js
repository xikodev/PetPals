const test = require('node:test');
const assert = require('node:assert/strict');
const { generateKeyPairSync, sign } = require('node:crypto');
const { verifyGoogleToken, createGoogleProvider } = require('../src/modules/auth/google.provider');
const { readAuthConfig } = require('../src/modules/auth/auth.config');
const { registrationFields, readCookie, pkceChallenge, randomToken } = require('../src/modules/auth/auth.security');
const { requireBookingAccess, requireRole } = require('../src/modules/auth/auth.middleware');

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const key = { ...publicKey.export({ format: 'jwk' }), kid: 'test-key', alg: 'RS256', use: 'sig' };
const now = Date.now();
const valid = { iss: 'https://accounts.google.com', aud: 'client', sub: 'google-id',
  email: 'test@example.com', email_verified: true, nonce: 'nonce',
  iat: Math.floor(now / 1000), exp: Math.floor(now / 1000) + 300 };
function jwt(claims = valid, header = { alg: 'RS256', kid: 'test-key' }) {
  const body = [header, claims].map((part) => Buffer.from(JSON.stringify(part)).toString('base64url')).join('.');
  return `${body}.${sign('RSA-SHA256', Buffer.from(body), privateKey).toString('base64url')}`;
}

test('verifies a signed Google identity and tolerates missing profile names', () => {
  const result = verifyGoogleToken(jwt(), [key], 'client', 'nonce', now);
  assert.equal(result.subject, 'google-id');
  assert.equal(result.firstName, '');
});

test('rejects invalid signature, issuer, audience, expiry, nonce and unverified email', () => {
  for (const changes of [{ iss: 'https://attacker.example' }, { aud: 'other' }, { azp: 'other' },
    { exp: 1 }, { exp: '99999999999' }, { nonce: 'other' }, { email_verified: false },
    { sub: '' }, { iat: valid.iat + 600 }, { nbf: valid.iat + 600 }]) {
    assert.throws(() => verifyGoogleToken(jwt({ ...valid, ...changes }), [key], 'client', 'nonce', now));
  }
  const tampered = jwt().split('.');
  tampered[1] = Buffer.from(JSON.stringify({ ...valid, sub: 'attacker' })).toString('base64url');
  assert.throws(() => verifyGoogleToken(tampered.join('.'), [key], 'client', 'nonce', now));
  assert.throws(() => verifyGoogleToken(jwt(valid, { alg: 'HS256', kid: 'test-key' }), [key], 'client', 'nonce', now));
  assert.throws(() => verifyGoogleToken(jwt(), [], 'client', 'nonce', now));
});

test('authorization requests bind state, nonce and S256 PKCE without calendar scopes', () => {
  const config = readAuthConfig({ GOOGLE_CLIENT_ID: 'client' });
  const provider = createGoogleProvider(config);
  const verifier = randomToken();
  const url = new URL(provider.authorizationUrl({ state: 'state', nonce: 'nonce', challenge: pkceChallenge(verifier) }));
  assert.equal(url.searchParams.get('scope'), 'openid email profile');
  assert.equal(url.searchParams.get('state'), 'state');
  assert.equal(url.searchParams.get('nonce'), 'nonce');
  assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(url.searchParams.get('code_challenge'), pkceChallenge(verifier));
});

test('registration accepts only owner/helper and ignores identity fields from the browser', () => {
  assert.deepEqual(registrationFields({ first_name: ' Ana ', last_name: ' Test ', role: 'owner',
    verification_status: 'approved', google_subject: 'attacker' }),
  { firstName: 'Ana', lastName: 'Test', role: 'owner' });
  for (const role of ['administrator', 'OWNER', null]) {
    assert.throws(() => registrationFields({ first_name: 'Ana', last_name: 'Test', role }));
  }
  assert.throws(() => registrationFields({ first_name: ' ', last_name: 'Test', role: 'helper' }));
});

test('requires HTTPS for production and rejects cookie ambiguity', () => {
  assert.throws(() => readAuthConfig({ NODE_ENV: 'production' }));
  assert.throws(() => readAuthConfig({ AUTH_BASE_URL: 'https://example.com/path' }));
  const config = readAuthConfig({ AUTH_BASE_URL: 'https://api.example.com' });
  assert.equal(config.cookieName, '__Host-petpals');
  const token = randomToken();
  assert.equal(readCookie(`petpals=${token}`, 'petpals'), token);
  assert.equal(readCookie(`petpals=${token}; petpals=${token}`, 'petpals'), null);
  assert.equal(readCookie('petpals=malformed', 'petpals'), null);
});

test('booking permissions reject pending, suspended and admin users', () => {
  function check(user, middleware = requireBookingAccess) {
    let result = 'allowed';
    const res = { status(code) { result = code; return this; }, json() {} };
    middleware({ auth: { user } }, res, () => {});
    return result;
  }
  assert.equal(check(null), 401);
  assert.equal(check({ role: 'owner', verification_status: 'pending' }), 403);
  assert.equal(check({ role: 'owner', verification_status: 'approved', suspended_until: new Date(Date.now() + 60000) }), 403);
  assert.equal(check({ role: 'administrator', verification_status: 'approved' }), 403);
  assert.equal(check({ role: 'helper', verification_status: 'approved' }), 'allowed');
  assert.equal(check({ role: 'owner' }, requireRole('administrator')), 403);
});
