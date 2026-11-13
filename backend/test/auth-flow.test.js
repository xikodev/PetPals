const test = require('node:test');
const assert = require('node:assert/strict');
const { createAuthHandlers } = require('../src/modules/auth/auth.routes');
const { createAuthRepository } = require('../src/modules/auth/auth.repository');
const { randomToken, hashToken } = require('../src/modules/auth/auth.security');

function fixture() {
  const sessions = new Map();
  let exchangeCount = 0;
  let existingUser = null;
  const repository = {
    async findSession(token) { return sessions.get(token) || null; },
    async destroySession(token) { sessions.delete(token); },
    async consumeOauth(token) {
      const session = sessions.get(token);
      if (session?.purpose !== 'oauth') return null;
      sessions.delete(token);
      return session.data;
    },
    async createSession(purpose, data, userId) {
      const token = randomToken();
      sessions.set(token, { purpose, data, user_id: userId, absolute_expires_at: new Date(Date.now() + 43200000) });
      return { token, maxAge: 600000 };
    },
    async findUserBySubject(subject) { assert.equal(subject, 'verified-subject'); return existingUser; },
    async findUserById() { return existingUser; },
    async touchSession() {},
    async deleteExpiredSessions() {},
  };
  const google = {
    authorizationUrl(params) { return `https://accounts.google.com/?${new URLSearchParams(params)}`; },
    async exchange(code, verifier, nonce) {
      exchangeCount++;
      assert.equal(code, 'code');
      assert.equal(verifier.length, 43);
      assert.equal(nonce.length, 43);
      return { subject: 'verified-subject', email: 'verified@example.com', firstName: 'Ana', lastName: 'Test' };
    },
  };
  const config = { cookieName: 'petpals', secure: false, origin: 'http://localhost:10000',
    clientId: 'client', clientSecret: 'secret' };
  const handlers = createAuthHandlers({ config, repository, google });
  const res = () => ({
    statusCode: 200,
    cookie(name, token, options) { this.token = token; this.cookieOptions = options; return this; },
    clearCookie() { this.cleared = true; return this; },
    redirect(url) { this.redirected = url; return this; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    end() { return this; },
  });
  return { sessions, repository, handlers, res, get exchangeCount() { return exchangeCount; },
    setUser(user) { existingUser = user; } };
}

async function begin(f) {
  const response = f.res();
  await f.handlers.start({ headers: {} }, response);
  const state = f.sessions.get(response.token).data.state;
  return { token: response.token, headers: { cookie: `petpals=${response.token}` }, query: { state, code: 'code' } };
}

test('new Google user gets short-lived onboarding, not a privileged user session', async () => {
  const f = fixture();
  const req = await begin(f);
  const res = f.res();
  await f.handlers.callback(req, res);
  assert.equal(res.redirected, '/api/auth/me');
  assert.equal(f.sessions.has(req.token), false);
  assert.notEqual(req.token, res.token);
  const session = f.sessions.get(res.token);
  assert.equal(session.purpose, 'registration');
  assert.equal(session.data.identity.subject, 'verified-subject');
  assert.equal(res.cookieOptions.httpOnly, true);
  assert.equal(res.cookieOptions.sameSite, 'lax');
});

test('callback requires browser cookie and matching state before token exchange', async () => {
  const f = fixture();
  const req = await begin(f);
  for (const input of [{ ...req, headers: {} }, { ...req, query: { state: 'wrong', code: 'code' } }]) {
    const res = f.res();
    await f.handlers.callback(input, res);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { error: 'invalid_state' });
  }
  assert.equal(f.exchangeCount, 0);
});

test('callback cannot be replayed, including concurrent callbacks', async () => {
  const f = fixture();
  const req = await begin(f);
  const responses = [f.res(), f.res()];
  await Promise.all(responses.map((res) => f.handlers.callback(req, res)));
  assert.equal(f.exchangeCount, 1);
  assert.equal(responses.filter((res) => res.redirected === '/api/auth/me').length, 1);
  assert.equal(responses.filter((res) => res.statusCode === 400).length, 1);
});

test('existing Google subject signs into its stored role without profile changes', async () => {
  const f = fixture();
  f.setUser({ id: 4, role: 'administrator', verification_status: 'approved' });
  const req = await begin(f);
  const res = f.res();
  await f.handlers.callback(req, res);
  assert.equal(res.redirected, '/profile');
  assert.equal(f.sessions.get(res.token).purpose, 'authenticated');
  assert.equal(f.sessions.get(res.token).user_id, 4);
  assert.equal(f.sessions.get(res.token).data.identity, undefined);
});

test('denied consent consumes the attempt and clears its cookie', async () => {
  const f = fixture();
  const req = await begin(f);
  req.query.error = 'access_denied';
  const res = f.res();
  await f.handlers.callback(req, res);
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { error: 'cancelled' });
  assert.equal(f.exchangeCount, 0);
  assert.equal(f.sessions.has(req.token), false);
  assert.equal(res.cleared, true);
});

test('registration and logout require both same origin and session-bound CSRF token', () => {
  const f = fixture();
  for (const [origin, token, allowed] of [
    ['http://localhost:10000', 'csrf', true], ['https://evil.example', 'csrf', false],
    ['http://localhost:10000', 'wrong', false], [undefined, 'csrf', false],
  ]) {
    let next = false;
    const res = f.res();
    f.handlers.csrf({ headers: { origin, 'x-csrf-token': token },
      auth: { session: { data: { csrf: 'csrf' } } } }, res, () => { next = true; });
    assert.equal(next, allowed);
    if (!allowed) assert.equal(res.statusCode, 403);
  }
});

test('logout removes server-side session and expires cookie', async () => {
  const f = fixture();
  const { token } = await f.repository.createSession('authenticated', { csrf: 'csrf' }, 4);
  const res = f.res();
  await f.handlers.logout({ auth: { token } }, res);
  assert.equal(f.sessions.has(token), false);
  assert.equal(res.cleared, true);
  assert.equal(res.statusCode, 204);
});

test('session storage hashes bearer tokens and specifies bounded expiry', async () => {
  const calls = [];
  const repository = createAuthRepository({ async query(sql, params) { calls.push({ sql, params }); return { rows: [] }; } });
  const session = await repository.createSession('authenticated', { csrf: 'csrf' }, 1);
  assert.equal(calls[0].params[0], hashToken(session.token));
  assert.equal(calls[0].params[4], 1800);
  assert.equal(calls[0].params[5], 43200);
  assert.equal(calls[0].params.includes(session.token), false);
  await repository.findSession(session.token);
  assert.match(calls[1].sql, /expires_at > CURRENT_TIMESTAMP/);
  assert.match(calls[1].sql, /absolute_expires_at > CURRENT_TIMESTAMP/);
});

test('failed registration rolls back consumed onboarding and releases connection', async () => {
  const calls = [];
  const client = { async query(sql) {
    calls.push(sql);
    if (sql.includes('DELETE FROM auth_sessions')) return { rows: [{ data: { identity: {
      subject: 'sub', email: 'verified@example.com', photoUrl: null,
    } } }] };
    if (sql.includes('INSERT INTO users')) throw new Error('database unavailable');
    return { rows: [] };
  }, release() { calls.push('release'); } };
  const repository = createAuthRepository({ async connect() { return client; } });
  await assert.rejects(repository.register(randomToken(), { firstName: 'Ana', lastName: 'Test', role: 'owner' }));
  assert.deepEqual(calls.slice(-2), ['ROLLBACK', 'release']);
  assert.equal(calls.includes('COMMIT'), false);
});
